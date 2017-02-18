'use strict';

const assert = require('assert');
const ProxyHttpClient = require('../libs/proxyHttpClient').ProxyHttpClient;

/**
 * Discovery model
 * Find service
 */
describe('discovery-proxy-http', () => {
  before((done) => {
    done();
  });

  it('get swagger.json', (done) => {
    let service = {
      endpoint: 'http://localhost:7616',
      schemaRoute: '/swagger.json'
    };

    let proxyHttpClient = new ProxyHttpClient();

    proxyHttpClient.request('get', service.endpoint+service.schemaRoute, {}).then((response) => {
        console.log(response);
        done();
    }).catch((error) => {
        done(error);
    });

  });

  after(() => {

  });
});
