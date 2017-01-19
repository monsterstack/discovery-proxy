'use strict';
const Promise = require('promise');
const PicoDB = require('picodb');
const discoveryClient = require('discovery-client');
const debug = require('debug')('discovery-proxy-connect');
const Proxy = require('./libs/proxy.js');


const connect = (options, callback) => {
  let proxy = null;
  discoveryClient.client.connect(options, (err, client) => {
    if(err) {
      callback(err);
    } else {
      if(proxy === null) {
        debug('New Proxy');
        proxy = new Proxy(client);
      } else {
        proxy.client = client;
      }

      console.log(`Proxy id is ${proxy.id}`);
      callback(null, proxy);
    }
  });
}

// @TODO: Proxy shouldn't have access to discovery-model repository..
// Move this to discovery-service.
const createErrorHandler = (serviceId, model) => {
  return function(options, err) {
    if (options.cleanup) {
      console.log('clean');
      if(model) {
        model.deleteService({id:serviceId}).then((service) => {
          console.log(`Cleaned up Service ${service.id}`);
          setTimeout(() => {
            process.exit();
          }, 500);
        }).error((error) => {
          console.log(`Service Delete failed ${serviceId}`);
          console.log(error);
          process.exit();
        });
      } else {
        setTimeout(() => {
          process.exit();
        }, 500);
      }
    }

    if (err) {
      console.log(err.stack);
      process.exit();
    }
  }
}

module.exports.client = discoveryClient.client;
exports.exitHandlerFactory = createErrorHandler;
module.exports.connect = connect;
