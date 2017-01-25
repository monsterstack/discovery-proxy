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
      console.log(api);
      assert(api, "Binding didn't fail");
      done();
    }).catch((err) => {
      assert(err === undefined, "Error didn't occur");
      done();
    });

  });

  after(() => {

  });
});
