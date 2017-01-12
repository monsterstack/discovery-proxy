'use strict';
const uuid = require('node-uuid');
const Promise = require('promise');
const PicoDB = require('picodb');

const ApiBinding = require('./apiBinding');

module.exports = class Proxy {
  constructor(client) {
    this.client = client;
    this.db = PicoDB.Create();
    this.routingTable = {};
    this.id = uuid.v1();

    let self = this;
    this.client.onDisconnect(() => {
      self.isBound = false;
    });
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
    let p = new Promise((resolve, reject) => {
      this.findAvailableByType(type).then((services) => {
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

  apiForService(service) {
    let p = new Promise((resolve, reject) => {
      let apiBinding = new ApiBinding(service);
      apiBinding.bind().then((api) => {
        resolve(api);
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

  bind(options) {
    console.log('Binding');
    let _added = (service) => {
      service._id = service.id;
      this.db.insertOne(service, (err, doc) => {
        if(err) {
          console.log(err);
        } else {
          console.log(`Added Service ${service.type} ${service.id}`);
          console.log(doc);
        }
      });
    }

    let _removed = (service) => {
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
    }

    let _updated = (service) => {
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
}
