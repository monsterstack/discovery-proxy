'use strict';
const Promise = require('promise');
const RedisSMQ = require("rsmq");
const Validator = require("jsonSchema").Validator;
const config = require('config');

class Queue {
  constructor(channel, rsmq) {
    this.rsmq = rsmq;
    this.channel = channel;

    // JSON Schema
    this.jsonSchema = null;
    this.validator = new Validator();
  }

  send(data) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      // @TODO: Here we want to validate against the json schema for this worker queue.
      // If the data payload isn't valid reject as error.
      // if(self.validator.validate(data, self.jsonSchema)) {
      self.rsmq.sendMessage({qname: this.channel.split("q://")[1], message: JSON.stringify(data)}, (err, response) => {
        if(err) reject(err);
        else
          resolve(response);
      });
      // } else {
      //    reject(new Error("Schema validation failed"));
      // }
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
      port: config.redis.port
    });
  }

  queue() {
    return this.queue;
  }

  bind(channelOverride) {
    let self = this;
    let p = new Promise((resolve, reject) => {
      try {
        // Build Queue from discriptor endpoint or channelOverride
        if(self.redisSmq) {
          let channel;
          if(channelOverride) {
            channel = channelOverride;
          } else {
            channel = self.descriptor.endpoint;
          }
          let queue = new Queue(channel, self.redisSmq);
          self.queue = queue;
          resolve(queue);
        } else {
          reject(new Error("Missing Queue Adapter"));
        }

      } catch (err) {
        reject(err);
      }
    });

    return p;
  }
}

module.exports = QueueBinding;
