'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');
const EventEmitter = require('events');
const debug = require('debug')('http-agent');

const handleResponse = (agent, perf, callback) => {
    return (err, res) => {
        let self = agent;
        if (res) {
          res = agent._formRes(res, perf);
        }

        self.itcList.forEach((itc) => {
            itc(res);
          });

        if (err) {
          if (err.code == 'ENOTFOUND') {
            debug('[ERROR] No device found at this address!');
            agent.emit('connection.err', err);
          }

          if (err.code == 'ECONNREFUSED') {
            debug('[ERROR] Connection reset! Please check the IP.');
            agent.emit('connection.err', err);
          }

          if (err.code == 'ECONNRESET') {
            debug('[ERROR] Connection refused! Please check the IP.');
            agent.emit('connection.err', err);
          }

          if (err.code == 'ETIMEDOUT') {
            debug('[ERROR] Connection timedout! Please check the IP.');
            agent.emit('connection.err', err);
          }

          if (err.code == 'ESOCKETTIMEDOUT') {
            debug('[ERROR] Connection timedout! Please check the IP.');
            agent.emit('connection.err', err);
          }
        }

        callback(err, res);
      };
  };

class HttpAgent extends EventEmitter {
  constructor() {
    super();
    this.itcList = [];
  }

  addResIntc(itc) {
    this.itcList.push(itc);
  }

  _startPerformance() {
    return {
        requestStart: Date.now(),
      };
  }

  _formRes(res, p) {
    res.performance = {
        requestStart: 0,
        requestStop: 10,
      };

    p.requestEnd = Date.now();

    res.performance = p;
    res.status = res.statusCode;
    res.statusText = HttpStatus[res.statusCode];
    res.url = this.path;
    return res;
  }

  _get(path, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.get(path, { headers: headers }, handleResponse(_this, p, callback));
  }

  _patch(path, body, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.patch(path, body, { headers: headers }, handleResponse(_this, p, callback));
  }

  _post(path, body, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.post(path, body, { headers: headers }, handleResponse(_this, p, callback));
  }

  _put(path, body, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.put(path, body, { headers: headers }, handleResponse(_this, p, callback));
  }

  _delete(path, body, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.delete(path, body, { headers: headers }, handleResponse(_this, p, callback));
  }

  _head(path, headers, callback) {
    let _this = this;
    let p = _this._startPerformance();
    needle.head(path, { headers: headers }, handleResponse(_this, p, callback));
  }

}

module.exports.HttpAgent = HttpAgent;
