'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');

class ProxyAgent {
    constructor(serviceId) {
        this.serviceId;
        this.itcList = [];
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

    _startPerformance() {
        return {
            requestStart: Date.now()
        };
    }

    _formRes(res, p) {
        res.performance = {
            requestStart: 0,
            requestStop: 10
        };

        p.requestEnd = Date.now();

        res.performance = p;
        res.status = res.statusCode;
        res.statusText = HttpStatus[res.statusCode];
        res.url = this.path;
        return res;
    }

    end(callback) {
        let self = this;
        if(this.method === 'get') {
            let p = self._startPerformance();
            needle.get(this.path, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }

                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else if(this.method === 'post') {
            let p = self._startPerformance();
            needle.post(this.path, this.body, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }
                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else if(this.method === 'put') {
            let p = self._startPerformance();
            needle.put(this.path, this.body, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }

                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else if(this.method === 'patch') {
            let p = self._startPerformance();
            needle.patch(this.path, this.body, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }

                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else if(this.method === 'delete') {
            let p = self._startPerformance();
            needle.delete(this.path, this.body, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }

                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else if(this.method === 'head') {
            let p = self._startPerformance();
            needle.head(this.path, { headers: this.headers }, (err, res) => {
                if(res) {
                    res = self._formRes(res, p);
                }

                self.itcList.forEach((itc) => {
                    itc(res);
                });
                callback(err, res);
            });
        } else {
            callback(new Error(`Unsupported method ${this.method}`));
        }
    }
}


module.exports.ProxyAgent = ProxyAgent;