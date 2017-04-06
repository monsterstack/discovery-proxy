'use strict';
const Promise = require('promise');
const RedisSMQ = require('rsmq');
const Validator = require('jsonschema').Validator;
const config = require('config');

const QUEUE_EXISTS_ERROR_MSG = 'Queue exists';

class Queue {
  constructor(channel, rsmq) {
    this.rsmq = rsmq;
    this.channel = channel;

    // JSON Schema
    this.jsonSchema = null;
    this.validator = new Validator();
  }

  send(data) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      // @TODO: Here we want to validate against the json schema for this worker queue.
      // If the data payload isn't valid reject as error.
      // if(_this.validator.validate(data, _this.jsonSchema)) {
      let qname = this.channel.split('q://')[1];
      _this.rsmq.createQueue({ qname: qname }, (err, resp) => {
        if (resp) {
          console.log('queue created');
          _this._send(qname, data).then((response) => {
            resolve(response);
          }).catch((err) => {
            reject(err);
          });
        } else {
          // If the Queue already exists then just send the message
          if (err.message === QUEUE_EXISTS_ERROR_MSG) {
            _this._send(qname, data).then((response) => {
              resolve(response);
            }).catch((err) => {
              reject(err);
            });
          } else {
            reject(err);
          }
        }
      });

      // } else {
      //    reject(new Error("Schema validation failed"));
      // }
    });

    return p;
  }

  _send(qname, data) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      _this.rsmq.sendMessage({ qname: qname, message: JSON.stringify(data) }, (err, response) => {
        if (err) reject(err);
        else
          resolve(response);
      });
    });
    return p;
  }
}

class QueueBinding {
  constructor(service) {
    this.descriptor = service;
    this.queue = null;

    this.redisSmq = new RedisSMQ({
      host: config.redis.host,
      port: config.redis.port,
    });
  }

  queue() {
    return this.queue;
  }

  bind(channelOverride) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
      try {
        // Download the jsonSchema.

        // Build Queue from discriptor endpoint or channelOverride
        if (_this.redisSmq) {
          let channel;
          if (channelOverride) {
            channel = channelOverride;
          } else {
            channel = _this.descriptor.endpoint;
          }

          let queue = new Queue(channel, _this.redisSmq);
          _this.queue = queue;
          resolve(queue);
        } else {
          reject(new Error('Missing Queue Adapter'));
        }

      } catch (err) {
        reject(err);
      }
    });

    return p;
  }
}

module.exports = QueueBinding;
