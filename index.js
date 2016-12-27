'use strict';
const Promise = require('promise');
const PicoDB = require('picodb');
const discoveryService = require('discovery-service');

class Proxy {
  constructor(client) {
    this.client = client;
    this.db = PicoDB.Create();
    this.routingTable = {};
  }

  findAvailableByType(type) {
    let self = this;
    let p = new Promise((reject, resolve) => {
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
    let p = new Promise((reject, resolve) => {
      this.findAvailableByType(type).then((services) => {
        let i = services.length;
        if(i > 0) {
          /* Should choose random from set */
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

  apiForService(service) {
    let p = new Promise((reject, resolve) => {
      resolve({}); // Need to fetch api based on service.schema
    });
    return p;
  }

  table() {
    let self = this;
    let p = new Promise((reject, resolve) => {
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

  bind(options) {
    let _added = (service) => {
      service._id = service.id;
      this.db.insertOne(service, (err, doc) => {
        console.log(doc);
      });
    }

    let _removed = (service) => {
      service._id = service.id;
      this.db.deleteOne(service, (err, doc) => {
        console.log(doc);
      });
    }

    let _updated = (service) => {
      service._id = service.id;
      this.db.deleteOne(service, (err, doc) => {
        console.log(doc);
      });
    }

    let _inited = (service) => {
      service._id = service.id;
      this.db.insertOne(service, (err, doc) => {
        console.log(doc);
      });
    }

    let handler = {
      added: _added,
      removed: _removed,
      updated: _updated,
      init: _inited
    }

    this.client.query(options.types, handler);
  }
}

const connect = (options, callback) => {
  discoveryService.client.connect(options, (client) => {
    let proxy = new Proxy(client);
    client.onDisconnect(() => {
      proxy.flush();
    });
    callback(proxy);
  });
}

module.exports.connect = connect;
