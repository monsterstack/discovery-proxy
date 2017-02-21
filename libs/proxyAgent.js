'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');
const HttpAgent = require('./httpAgent').HttpAgent;

class ProxyAgent extends HttpAgent {
    constructor(serviceId) {
        super();
        this.serviceId = serviceId;
        this.headers = {};
        this.body = null;
        this.path = null;
    }

    set(key, value) {
        if(this.headers)
            this.headers[key] = value;
        else {
            this.headers = {};
            this.headers[key] = value;
        }
        return this;
    }

    addResIntc(itc) {
        this.itcList.push(itc);
    }

    get(path) {
        this.method = 'get';
        this.path = path;
        return this;
    }

    post(path) {
        this.method = 'post';
        this.path = path;
        return this;
    }

    put(path) {
        this.method = 'put';
        this.path = path;
        return this;
    }

    delete(path) {
        this.method = 'delete';
        this.path = path;
        return this;
    }

    head(path) {
        this.method = 'head';
        this.path = path;
        return this;
    }

    headers(headers) {
        this.headers = headers;
        return this;
    }

    header(key, value) {
        this.set(key, value);
    }

    query(parameterObj) {
        let path = this.path || "";
        let keys = Object.keys(parameterObj);

        let hasQuery = false;
        if(keys.length > 0) {
            path += '?';
            hasQuery = true;
        }

        keys.forEach((key)  => {
            path += `${key}=${parameterObj[key]}&`
        });

        if(hasQuery)
            this.path = path.slice(0, -1);

        return this;
    }

    accept(type) {
        if(this.headers)
            this.headers['Accept'] = type;
        else {
            this.headers = { 'Accept': type };
        }
    }

    send(body) {
        this.body = body;
        return this;
    }

    end(callback) {
        let self = this;
        if(self.method === 'get') {
            self._get(self.path, self.headers, callback);
        } else if(self.method === 'post') {
            self._post(self.path, self.body, self.headers, callback);
        } else if(self.method === 'put') {
            self._put(self.path, self.body, self.headers, callback);
        } else if(self.method === 'patch') {
            self._patch(self.path, self.body, self.headers, callback);
        } else if(self.method === 'delete') {
            self._delete(self.path, self.body, self.headers, callback);
        } else if(self.method === 'head') {
            self._head(self.path, self.headers, callback);
        } else {
            callback(new Error(`Unsupported method ${this.method}`));
        }
    }


}


module.exports.ProxyAgent = ProxyAgent;