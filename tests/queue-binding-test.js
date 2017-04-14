'use strict';

const assert = require('assert');
const QueueBinding = require('../libs/queueBinding');

/**
 * Discovery model
 * Queue binding
 */
describe('discovery-proxy', () => {
  before((done) => {
    done();
  });

  it('queue created when binding occurs', (done) => {
    let service = {
      endpoint: 'q://emails',
      schemaRoute: '/payload.schema',
    };

    let queueBinding = new QueueBinding(service);

    queueBinding.bind().then((queue) => {
      assert(queue, "Binding didn't fail");

      queue.send({ msg: 'Hello' }).then((resp) => {
        done();
      }).catch((err) => {
        done(err);
      });
    }).catch((err) => {
      assert(err === undefined, "Error didn't occur");
      done(err);
    });

  }).timeout(3000);

  after(() => {

  });
});
