'use strict';

class ApiCache {
  constructor(options) {

    this.options = options || {};

    if (!options.ttl) {
      options.ttl = 120; // seconds = 2 min.
    }

    this.apiCache = {};
  }

  set(key, obj) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
        _this.apiCache[key] = {
            obj: obj,
            created_timestamp: Date.now(),
            ttl: _this.options.ttl,
          };

        resolve();
      });

    return p;
  }

  get(key) {
    let _this = this;
    let p = new Promise((resolve, reject) => {
        let obj = _this.apiCache[key];
        if (obj) {
          let createdTime = obj.created_timestamp;
          let ttl = obj.ttl;

          if (createdTime + (ttl * 1000) < Date.now()) {

            resolve(null);
            /* Remove entry */
            delete _this.apiCache[key];
          } else {
            resolve(obj.obj);
          }
        } else {
          resolve(null);
        }
      });

    return p;
  }
}

// Public
module.exports.ApiCache = ApiCache;
