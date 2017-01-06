'use strict';
const Promise = require('promise');
const PicoDB = require('picodb');
const discoveryService = require('discovery-service');

const Proxy = require('./libs/proxy.js');

const connect = (options, callback) => {
  discoveryService.client.connect(options, (err, client) => {
    if(err) {
      callback(err);
    } else {
      let proxy = new Proxy(client);
      client.onDisconnect(() => {
        proxy.flush();
      });
      callback(null, proxy);
    }
  });
}

module.exports.connect = connect;
