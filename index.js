'use strict';
const Promise = require('promise');
const PicoDB = require('picodb');
const discoveryService = require('discovery-service');

const Proxy = require('./libs/proxy.js');

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
