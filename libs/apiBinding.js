'use strict';
const debug = require('debug')('apiBinding');
const fetchSchema = require('fetch-swagger-schema');
const SwaggerNodeClient = require('swagger-client');
const Promise = require('promise');

const ProxyAgent = require('./proxyAgent').ProxyAgent;

const EventEmitter = require('events');

class ApiBinding extends EventEmitter {
  constructor(service) {
    super();
    this.responseTimeEventKey = 'response.time';
    this.descriptor = service;
    this.api = null;

    this.requestAgent = require('superagent-extend');
    this.requestAgent = new ProxyAgent(service._id);
    let self = this;
    this.requestAgent.addResIntc((res) => {
      console.log(self.requestAgent.serviceId);
      console.log(res.performance);
      console.log(res.url);
      if(res.performance) {
        console.log('Emitting performance for request');
        let metric = {
          serviceId: service._id, 
          url: res.url, 
          time: res.performance.requestEnd - res.performance.requestStart 
        };
        console.log(metric);
        self.emit(self.responseTimeEventKey, metric);
      }
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
          requestAgent: self.requestAgent,
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
    this.emit(this.responseTimeEventKey, { serviceId: self.service.id, value: responseTime, type: this.responseTimeEventKey});
  }
}

module.exports = ApiBinding;
