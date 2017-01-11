'use strict';
const debug = require('debug')('apiBinding');
const fetchSchema = require('fetch-swagger-schema');
const SwaggerNodeClient = require('swagger-client');
const Promise = require('promise');

class ApiBinding {
  constructor(service) {
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
}

module.exports = ApiBinding;
