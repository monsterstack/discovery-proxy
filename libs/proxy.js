'use strict';
const uuid = require('node-uuid');
const Promise = require('promise');
const PicoDB = require('picodb');
const ApiCache = require('./apiCache').ApiCache;
const ApiBinding = require('./apiBinding');
const QueueBinding = require('./queueBinding');
const debug = require('debug')('discovery-proxy');

module.exports = class Proxy {
  constructor(client) {
    this.client = client;
    this.db = PicoDB.Create();
    this.apiCache = new ApiCache({ stdTTL: 15 * 60, checkperiod: 1 * 60 });
    this.id = uuid.v1();

    if (this.client) {
      let _this = this;
      this.client.onDisconnect(() => {
        _this.isBound = false;
        debug('>>>>>>>>>>>>>>>>>> Handlers Cleared >>>>>>>>>>>>');
        _this.client.clearHandlers();
      });
    }

    this._initDb();
  }

  findAvailableByType(type) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.db.find({ type: type, status: 'Online' }).toArray((err, docs) => {
        if (err) reject(err);
        else {
          resolve(docs);
        }
      });
    });

    return p;
  }

  findOneAvailableByType(type) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.findAvailableByType(type).then((services) => {
        let i = services.length;
        if (i > 0) {
          let randomServiceIndex = Math.floor(Math.random(i));
          /* Should choose random from set - or consider avg. rtime */
          resolve(services[randomServiceIndex]);
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
    debug(`Sending response.time metric for ${responseTime.serviceId}`);
    if (this.client)
      this.client.sendResponseTimeMetric(responseTime);
  }

  sendOfflineStatus(serviceId) {
    if (this.client)
      this.client.sendOfflineStatus(serviceId);
  }

  apiForServiceType(type) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.findOneAvailableByType(type).then((serviceDescriptor) => {
        if (serviceDescriptor) {
          _this.apiForService(serviceDescriptor).then((api) => {
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
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.findOneAvailableByType(type).then((serviceDescriptor) => {
        if (serviceDescriptor) {
          _this.queueForService(serviceDescriptor).then((queue) => {
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
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.apiCache.get(service._id).then((api) => {
        if (api) {
          resolve(api);
        } else {
          let apiBinding = new ApiBinding(service);
          apiBinding.onConnectionError((connectionErrEvent) => {
            _this.sendOfflineStatus(service._id);
          });
          return apiBinding.bind();
        }
      }).then((api) => {
        api.on(api.responseTimeEventKey, (responseTimeMetric) => {
          // Send
          let metric = {
            type: api.responseTimeEventKey,
            serviceId: responseTimeMetric.serviceId,
            value: responseTimeMetric.time,
          };
          _this.sendResponseTimeMetric(metric);
        });
        return api;
      }).then((api) => {
        _this.apiCache.set(service._id, api).then(() => {
          debug('Api Cached');
        }).catch((err) => {
          debug('Failed to cache api ---------------------------');
          debug(err);
        });

        resolve(api);
      }).catch((err) => {
        reject(err);
      });
    });
    return p;
  }

  queueForService(service) {
    let _this = this;
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
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.db.find({}).toArray((err, docs) => {
        // docs is an array of documents that match the query.
        if (err) reject(err);
        else {
          resolve(docs);
        }
      });
    });

    return p;
  }

  flush() {
    this.db.deleteMany({}, (err, num) => {
      debug(`Deleted ${num} documents`);
    });
  }

  sideLoadService(service) {
    service._id = service.id;
    let p = new Promise((resolve, reject) => {
      this.db.insertOne(service, (err, doc) => {
        if (err) {
          debug(err);
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
    return p;
  }

  sideLoadServices(services) {
    services.forEach((service) => {
      service._id = service.id;
    });

    let p = new Promise((resolve, reject) => {
      this.db.insertMany(services, (err, docs) => {
        if (err) {
          debug(err);
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });

    return p;
  }

  bind(options) {
    debug('Binding');
    let _added = (service) => {
      debug(`Adding Service of type ${service.type}`);
      if (options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        this.db.insertOne(service, (err, doc) => {
          if (err) {
            debug(err);
          } else {
            debug(`Added Service ${service.type} ${service.id}`);
            debug(doc);
          }
        });
      } else {
        debug(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    };

    let _removed = (service) => {
      debug(`Removing Service of type ${service.type}`);
      if (options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        debug(`Removing Service ${service.type} ${service.id}`);
        this.db.deleteOne(service, (err, numModified) => {
          if (err) {
            debug(err);
          } else {
            debug(`Removed Service ${service.type} ${service.id}`);
            debug(numModified);
          }
        });
      } else {
        debug(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    };

    let _updated = (service) => {
      debug(`Updating Service of type ${service.type}`);
      if (options.types.indexOf(service.type) != -1) {
        service._id = service.id;
        debug(`Updating Service ${service.type} ${service.id}`);
        this.db.updateOne({ _id: service.id }, service, (err, doc) => {
          if (err) {
            debug(err);
          } else {
            debug(`Updated Service ${service.type} ${service.id}`);
            debug(doc);
          }
        });
      } else {
        debug(`Received notification for service of no interest... BUG! ${service.type}`);
      }
    };

    let _inited = (service) => {
      service._id = service.id;
      debug(`Initing Service ${service.type} ${service.id}`);
      this.db.insertOne(service, (err, doc) => {
        if (err) {
          debug(err);
        } else {
          debug(`Inited Service ${service.type} ${service.id}`);
          debug(doc);
        }
      });
    };

    let _sync = (services) => {
      debug(`Syncing Services`);
      this.db.deleteMany({}, (err, numRemoved) => {
        if (!err) {
          services.forEach((service) => {
            service._id = service.id;
          });

          this.db.insertMany(services, (err, docs) => {
            if (err) debug(err);
            else {
              debug(`Synced services`);
            }
          });
        } else {
          debug('Failed to clear routing table @_sync');
        }
      });
    };

    let handler = {
      added: _added,
      removed: _removed,
      updated: _updated,
      init: _inited,
      sync: _sync,
    };

    this.client.query(options.descriptor, options.types, handler);

    this.isBound = true;
  }

  _initDb() {
    // Initialize db.. this is LAme!!!!!!
    this.db.insertOne({ i: 45444 }, (err, result) => {
      if (result)
        this.db.deleteOne({ i: 45444 });
    });
  }
};

