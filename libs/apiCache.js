'use strict';
const NodeCache = require('node-cache');

class ApiCache {
    constructor(options) {
        
        this.options = options || {};
        
        this.apiCache = new NodeCache({ stdTTL: this.options.ttl || 15*60, checkperiod: this.options.checkperiod || 1*60 });
    }

    set(key, obj) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.apiCache.set(key, obj, (err, success) => {
                if( !err && success ) {
                    resolve();
                } else {
                    reject(err);
                }
            });
        });

        return p;
    }


    get(key) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.apiCache.get(key, (err, value) => {
                if( !err ) {
                    if(value == undefined) {
                        resolve(null);
                    } else {
                        resolve(value);
                    }
                } else {
                    reject(err);
                }
            });
        });

        return p;
    }
}

// Public 
module.exports.ApiCache = ApiCache;