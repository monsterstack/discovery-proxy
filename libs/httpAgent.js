'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');

const handleResponse = (agent, perf, callback) => {
    return (err, res) => {
        let self = agent;
        if(res) {
            res = agent._formRes(res, perf);
        }

        self.itcList.forEach((itc) => {
            itc(res);
        });
        callback(err, res);
    }
}

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
        needle.get(path, { headers: headers }, handleResponse(self, p, callback));
    }

    _patch(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.patch(path, body, { headers: headers }, handleResponse(self, p, callback));
    }

     _post(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.post(path, body, { headers: headers }, handleResponse(self, p, callback));
    }


    _put(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.put(path, body, { headers: headers }, handleResponse(self, p, callback));
    }

    _delete(path, body, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.delete(path, body, { headers: headers }, handleResponse(self, p, callback));
    }

    _head(path, headers, callback) {
        let self = this;
        let p = self._startPerformance();
        needle.head(path, { headers: headers }, handleResponse(self, p, callback));
    }

}

module.exports.HttpAgent = HttpAgent;