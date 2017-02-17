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


  _httpClient() {
    return {
      execute: (obj) => {
        let method = obj.method;
        let headers = obj.headers;
        let body = obj.body;
        let url = obj.url;

        let proxyHttpClient = new proxyHttpClient();

        proxyHttpClient.request(method, url, headers, body).then((response) => {
          if(response.error) {
            obj.on.error(response);
          } else {
            obj.on.response(response);
          }
        }).catch((error) => {
          obj.on.error(error);
        });
      }
    }
  }
}

module.exports = ApiBinding;
