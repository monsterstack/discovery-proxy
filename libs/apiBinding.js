'use strict';
const debug = require('debug')('apiBinding');
const fetchSchema = require('fetch-swagger-schema');
const SwaggerNodeClient = require('swagger-client');
const Promise = require('promise');
const ProxyHttpClient = require('./proxyHttpClient').ProxyHttpClient;
const Stopwatch = require("node-stopwatch").Stopwatch;
const EventEmitter = require('events');

class ApiBinding extends EventEmitter {
  constructor(service) {
    super();
    this.responseTimeEventKey = 'response.time';
    this.descriptor = service;
    this.api = null;
  }

  api() {
    return this.api;
  }

  bind(schemaOverride) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      try {
        let schemaUrl = self.descriptor.endpoint + self.descriptor.schemaRoute;
        let api = new SwaggerNodeClient({
          url: schemaUrl,
          client: self._httpClient(),
          success: () => {
            self.api = api;
            resolve(self);
          },
          error: (err) => {
            reject(err);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
    return p;
  }

  _emitResponseTime(responseTime) {
    this.emit(this.responseTimeEventKey, { serviceId: self.service.id, value: responseTime});
  }


  _httpClient() {
    let self = this;
    return {
      execute: (obj) => {
        let method = obj.method;
        let headers = obj.headers;
        let body = obj.body;
        let url = obj.url;

        let proxyHttpClient = new ProxyHttpClient();
        let stopwatch = Stopwatch.create();
        stopwatch.start();
        proxyHttpClient.request(method, url, headers, body).then((response) => {
          if(response.error) {
            console.log(`Error ${response.error}`);
            stopwatch.stop();
            obj.on.error(response);
          } else {
            stopwatch.stop();
            let elapsedTime = stopwatch.elapsedMilliseconds;
            self._emitResponseTime(elapsedTime);
            obj.on.response(response);
          }
        }).catch((error) => {
          stopwatch.stop();
          obj.on.error(error);
        });
      }
    }
  }
}

module.exports = ApiBinding;
