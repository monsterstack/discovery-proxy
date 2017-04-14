'use strict';
const debug = require('debug')('apiBinding');
const fetchSchema = require('fetch-swagger-schema');
const SwaggerNodeClient = require('swagger-client');
const Promise = require('promise');
const Bluebird = require('bluebird');

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

    let _this = this;
    this.requestAgent.addResIntc((res) => {
      debug(_this.requestAgent.serviceId);

      if (res && res.performance) {
        debug(res.performance);
        debug(res.url);
        debug('Emitting performance for request');
        let metric = {
          serviceId: service._id,
          url: res.url,
          time: res.performance.requestEnd - res.performance.requestStart,
        };
        debug(metric);
        _this.emit(self.responseTimeEventKey, metric);
      }
    });
  }

  onConnectionError(cb) {
    this.requestAgent.onConnectionError((connectionErrEvent) => {
      if (connectionErrEvent.hasOwnProperty('err')
        && connectionErrEvent.hasOwnProperty('serviceId')) {
        cb(connectionErrEvent);
      } else {
        throw new Error('Invalid Connection Error Event Received');
      }
    });
  }

  api() {
    return this.api;
  }

  bind(schemaOverride) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      try {
        let schemaUrl = _this.descriptor.endpoint + _this.descriptor.schemaRoute;
        let api = new SwaggerNodeClient({
          url: schemaUrl,
          requestAgent: _this.requestAgent,
          success: () => {
            // Promisify the apis
            Bluebird.promisifyAll(api.apis);
            _this.api = api;
            resolve(_this);
          },

          error: (err) => {
            reject(err);
          },
        });
      } catch (error) {
        reject(error);
      }
    });
    return p;
  }

  _emitResponseTime(responseTime) {
    this.emit(this.responseTimeEventKey, {
      serviceId: this.service.id,
      value: responseTime,
      type: this.responseTimeEventKey,
    });
  }
}

module.exports = ApiBinding;
