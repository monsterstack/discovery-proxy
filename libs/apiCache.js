'use strict';

class ApiCache {
    constructor(options) {
        
        this.options = options || {};
        
        if(!options.ttl) {
            options.ttl = 120; // seconds = 2 min.
        }

        this.apiCache = {};
    }

    set(key, obj) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.apiCache[key] = {
                obj: obj,
                created_timestamp: Date.now(),
                ttl: self.options.ttl
            };
            
            resolve();
        });

        return p;
    }


    get(key) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let obj = self.apiCache[key];
            if(obj) {
                let createdTime = obj.created_timestamp;
                let ttl = obj.ttl;

                let expired = false;
                if(createdTime + (ttl*1000) < Date.now()) {
                    expired = true;

                    resolve(null);
                    /* Remove entry */
                    delete self.apiCache[key];
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