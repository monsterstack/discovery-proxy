'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');
class HttpAgent {
    constructor() {
        this.itcList = [];
    }

    addResIntc(itc) {
        this.itcList.push(itc);
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

    _get(path, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.get(path, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }

    _patch(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.patch(path, body, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }

     _post(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.post(path, body, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }


    _put(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.put(path, body, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }

    _delete(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.delete(path, body, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }

    _head(path, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.head(path, { headers: headers }, (err, res) => {
            if(res) {
                res = self._formRes(res, p);
            }

            self.itcList.forEach((itc) => {
                itc(res);
            });
            callback(err, res);
        });
    }

}

module.exports.HttpAgent = HttpAgent;