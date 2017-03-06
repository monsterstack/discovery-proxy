'use strict';
const uuid = require('node-uuid');
const Promise = require('promise');
const PicoDB = require('picodb');
const ApiCache = require('./apiCache').ApiCache;
const ApiBinding = require('./apiBinding');
const QueueBinding = require('./queueBinding');

module.exports = class Proxy {
  constructor(client) {
    this.client = client;
    this.db = PicoDB.Create();
    this.apiCache = new ApiCache({ stdTTL: 15*60, checkperiod: 1*60 });
    this.id = uuid.v1();

    if(this.client) {
      let self = this;
      this.client.onDisconnect(() => {
        self.isBound = false;
        console.log(">>>>>>>>>>>>>>>>>> Handlers Cleared >>>>>>>>>>>>");
        self.client.clearHandlers();
      });
    }

    this._initDb();
  }

  findAvailableByType(type) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.db.find({type: type, status: 'Online'}).toArray((err, docs) => {
        if(err) reject(err);
        else {
          resolve(docs);
        }
      });
    });

    return p;
  }

  findOneAvailableByType(type) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.findAvailableByType(type).then((services) => {
        let i = services.length;
        if(i > 0) {
          /* Should choose random from set - or consider avg. rtime */
          resolve(services[0]);
        } else {
          resolve(null);
        }
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  sendResponseTimeMetric(responseTime) {
    console.log(`Sending response.time metric for ${responseTime.serviceId}`);
    if(this.client)
      this.client.sendResponseTimeMetric(responseTime);
  }

  sendOfflineStatus(serviceId) {
    if(this.client)
      this.client.sendOfflineStatus(serviceId);
  }

  apiForServiceType(type) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.findOneAvailableByType(type).then((serviceDescriptor) => {
        if(serviceDescriptor) {
          self.apiForService(serviceDescriptor).then((api) => {
            resolve(api);
          }).catch((err) => {
            reject(err);
          });
        } else {
          resolve(null);
        }
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  queueForServiceType(type) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.findOneAvailableByType(type).then((serviceDescriptor) => {
        if(serviceDescriptor) {
          self.queueForService(serviceDescriptor).then((queue) => {
            resolve(queue);
          }).catch((err) => {
            reject(err);
          });
        } else {
          resolve(null);
        }
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  apiForService(service) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.apiCache.get(service._id).then((api) => {
        if(api) {
          resolve(api);
        } else {
          let apiBinding = new ApiBinding(service);
          apiBinding.onConnectionError((connectionErrEvent) => {
            self.sendOfflineStatus(service._id);
          });
          return apiBinding.bind();
        }
      }).then((api) => {
        api.on(api.responseTimeEventKey, (responseTimeMetric) => {
          // Send
          let metric = {
            type: api.responseTimeEventKey,
            serviceId: responseTimeMetric.serviceId,
            value: responseTimeMetric.time
          };
          self.sendResponseTimeMetric(metric);
        });
        return api;
      }).then((api) => {
        self.apiCache.set(service._id, api).then(() => {
          console.log('Api Cached');
        }).catch((err) => {
          console.log('Failed to cache api');
          console.log(err);
        });

        resolve(api);
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  queueForService(service) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      let queueBinding = new QueueBinding(service);
      queueBinding.bind().then((q) => {
        resolve(q);
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  table() {
    let self = this;
    let p = new Promise((resolve, reject) => {
      self.db.find({}).toArray((err, docs) => {
        // docs is an array of documents that match the query.
        if(err) reject(err);
        else {
          resolve(docs);
        }
      });
    });

    return p;
  }

  flush() {
    this.db.deleteMany({}, (err, num) => {
      console.log(`Deleted ${num} documents`);
    });
  }

  sideLoadService(service) {
    service._id = service.id;
    let p = new Promise((resolve, reject) => {
      this.db.insertOne(service, (err, doc) => {
        if(err) {
          console.log(err);
          reject(err);
        } else {
          console.log(`Added Service ${service.type} ${service.id}`);
          resolve(doc);
        }
      });
    });
    return p;
  }

  bind(options) {
    console.log('Binding');
    let _added = (service) => {
      console.log(`Adding Service of type ${service.type}`);
      if(options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        this.db.insertOne(service, (err, doc) => {
          if(err) {
            console.log(err);
          } else {
            console.log(`Added Service ${service.type} ${service.id}`);
            console.log(doc);
          }
        });
      } else {
        console.log(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    }

    let _removed = (service) => {
      console.log(`Removing Service of type ${service.type}`);
      if(options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        console.log(`Removing Service ${service.type} ${service.id}`);
        this.db.deleteOne(service, (err, numModified) => {
          if(err) {
            console.log(err);
          } else {
            console.log(`Removed Service ${service.type} ${service.id}`);
            console.log(numModified);
          }
        });
      } else {
        console.log(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    }

    let _updated = (service) => {
      console.log(`Updating Service of type ${service.type}`);
      if(options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        console.log(`Updating Service ${service.type} ${service.id}`);
        this.db.updateOne({_id:service.id}, service, (err, doc) => {
          if(err) {
            console.log(err);
          } else {
            console.log(`Updated Service ${service.type} ${service.id}`);
            console.log(doc);
          }
        });
      } else {
        console.log(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    }

    let _inited = (service) => {
      service._id = service.id;
      console.log(`Initing Service ${service.type} ${service.id}`);
      this.db.insertOne(service, (err, doc) => {
        if(err) {
          console.log(err);
        } else {
          console.log(`Inited Service ${service.type} ${service.id}`);
          console.log(doc);
        }
      });
    }

    let handler = {
      added: _added,
      removed: _removed,
      updated: _updated,
      init: _inited
    }

    this.client.query(options.descriptor, options.types, handler);

    this.isBound = true;
  }

  _initDb() {
    // Initialize db.. this is LAme!!!!!!
    this.db.insertOne({i:45444}, (err, result) => {
      if(result)
        this.db.deleteOne({i:45444});
    });
  }
}
