'use strict';
const Proxy = require('../libs/proxy');

const servicesToSideLoad = [
  {
    docsPath: 'http://cloudfront.mydocs.com/foo',
    endpoint: `http://localhost:1234`,
    healthCheckRoute:  '/health',
    region:  'us-east-1',
    schemaRoute:  '/swagger.json',
    stage:  'dev',
    status:  'Online',
    timestamp: Date.now(),
    type:  'FooService',
    version:  'v1',
  },
  {
    docsPath: 'http://cloudfront.mydocs.com/bar',
    endpoint: `http://localhost:1234`,
    healthCheckRoute:  '/health',
    region:  'us-east-1',
    schemaRoute:  '/swagger.json',
    stage:  'dev',
    status:  'Online',
    timestamp: Date.now(),
    type:  'BarService',
    version:  'v1',
  },
];

describe('side-load-proxy-test', () => {
  let proxy = new Proxy();
  before((done) => {
    done();
  });

  it('Expect 2 Services in Cache after Side Load', (done) => {
    proxy.sideLoadServices(servicesToSideLoad).then((cache) => {
      if (cache) {
        if (cache.length === 2) {
          done();
        } else {
          done(new Error('Expected 2 Side Loaded Services'));
        }
      } else {
        done(new Error('Expected Proxy Cache to be non-null'));
      }
    });
  });

  it('Expect 1 Service in Cache after Side Load', (done) => {
    proxy.sideLoadService(servicesToSideLoad[0]).then((cache) => {
      if (cache) {
        if (cache.length === 1) {
          done();
        } else {
          done(new Error('Expected 1 Side Loaded Services'));
        }
      } else {
        done(new Error('Expected Proxy Cache to be non-null'));
      }
    });
  });

  after((done) => {
    done();
  });
});
