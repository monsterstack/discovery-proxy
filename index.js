'use strict';
const Promise = require('promise');
const PicoDB = require('picodb');
const discoveryClent = require('discovery-client');
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

module.exports.client = discoveryService.client;
module.exports.connect = connect;
