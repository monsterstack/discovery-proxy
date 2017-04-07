'use strict';

const assert = require('assert');
const ApiBinding = require('../libs/apiBinding');
const debug = require('debug')('api-binding');
/**
 * Discovery model
 * Find service
 */
describe('discovery-proxy', () => {
  before((done) => {
    done();
  });

  it('api created when binding occurs', (done) => {
    let service = {
      id: '1111',
      endpoint: 'http://petstore.swagger.io/v2',
      schemaRoute: '/swagger.json',
    };

    let apiBinding = new ApiBinding(service);

    apiBinding.bind().then((api) => {
      assert(api, "Binding didn't fail");
      done();
    }).catch((err) => {
      assert(err === undefined, "Error didn't occur");
      done();
    });

  });

  it('api request works', (done) => {
    let service = {
      endpoint: 'http://petstore.swagger.io/v2',
      schemaRoute: '/swagger.json',
    };
    let apiBinding = new ApiBinding(service);

    apiBinding.on('response.performance', (perf) => {
      debug(perf);
    });

    apiBinding.bind().then((service) => {
      service.api.pet.findPetsByTags({ tags: [] }, (response) => {
        done();
      }, (err) => {
        done(new Error('Request Failed'));
      });
    }).catch((err) => {
      done(err);
    });
  });

  after(() => {

  });
});
