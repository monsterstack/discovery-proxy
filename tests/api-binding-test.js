'use strict';

const assert = require('assert');
const ApiBinding = require('../libs/apiBinding');

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
      endpoint: 'http://localhost:7616',
      schemaRoute: '/swagger.json'
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
      endpoint: 'http://localhost:7616',
      schemaRoute: '/swagger.json'
    };
    console.log("Creating Binding");
    let apiBinding = new ApiBinding(service);

    apiBinding.bind().then((service) => {
      service.api.services.getServices({}, (response) => {
        console.log(response.obj);
        done();
      }, (err) => {
        console.log(err.obj);
        done(new Error("Request Failed"));
      });  
    }).catch((err) => {
      done(err);
    });
  });


  after(() => {

  });
});
