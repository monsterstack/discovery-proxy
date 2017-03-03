'use strict';

class ApiCache {
    constructor(options) {
        
        this.options = options || {};
        
        if(!options.ttl) {
            options.ttl = 5*1000;
        }

        this.apiCache = {};
    }

    set(key, obj) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.apiCache[key] = obj;
            
            setTimeout(() => {
                delete self.apiCache[key];
            }, self.options.ttl);

            resolve();
        });

        return p;
    }


    get(key) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let obj = self.apiCache[key];
            if(obj) resolve(obj);
            else resolve(null);
        });

        return p;
    }
}

// Public 
module.exports.ApiCache = ApiCache;