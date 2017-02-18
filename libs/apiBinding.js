'use strict';
const debug = require('debug')('apiBinding');
const fetchSchema = require('fetch-swagger-schema');
const SwaggerNodeClient = require('swagger-client');
const Promise = require('promise');

const EventEmitter = require('events');

class ApiBinding extends EventEmitter {
  constructor(service) {
    super();
    this.responseTimeEventKey = 'response.time';
    this.descriptor = service;
    this.api = null;

    this.requestAgent = require('superagent-extend');
    let self = this;
    this.requestAgent.util.addResIntc((res) => {
      self.emit('response.time', { url: res.url, time: response.performance.requestEnd - response.performance.requestStart });
    });
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
          requestAgent: self.requestAgent.request,
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
}

module.exports = ApiBinding;
