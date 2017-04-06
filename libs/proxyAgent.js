'use strict';
const needle = require('needle');
const HttpStatus = require('http-status');
const HttpAgent = require('./httpAgent').HttpAgent;

// HTTP Methods
const GET = 'get';
const POST = 'post';
const PUT = 'put';
const HEAD = 'head';
const PATCH = 'patch';
const DELETE = 'delete';

// Headers
const ACCEPT_HEADER = 'Accept';

class ProxyAgent extends HttpAgent {
  constructor(serviceId) {
    super();
    this.serviceId = serviceId;
    this.headers = {};
    this.body = null;
    this.path = null;
  }

  onConnectionError(cb) {
    let _this = this;
    let error = (cb) => {
        return (err) => {
            cb({ serviceId: _this.id, err: err });
          };
      };

    this.on('connection.err', error(cb));
  }

  set(key, value) {
    if (this.headers)
        this.headers[key] = value;
    else {
      this.headers = {};
      this.headers[key] = value;
    }

    return this;
  }

  get(path) {
    this.method = GET;
    this.path = path;
    return this;
  }

  post(path) {
    this.method = POST;
    this.path = path;
    return this;
  }

  put(path) {
    this.method = PUT;
    this.path = path;
    return this;
  }

  delete(path) {
    this.method = DELETE;
    this.path = path;
    return this;
  }

  head(path) {
    this.method = HEAD;
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
    let path = this.path || '';
    let keys = Object.keys(parameterObj);

    let hasQuery = false;
    if (keys.length > 0) {
      path += '?';
      hasQuery = true;
    }

    keys.forEach((key)  => {
        path += `${key}=${parameterObj[key]}&`;
      });

    if (hasQuery)
        this.path = path.slice(0, -1);

    return this;
  }

  accept(type) {
    if (this.headers)
        this.headers[ACCEPT_HEADER] = type;
    else {
      this.headers = {};
      this.headers[ACCEPT_HEADER] = type;
    }
  }

  send(body) {
    this.body = body;
    return this;
  }

  /**
   * End.  Invoke the http request to the service.
   *
   * @TODO
   * This callback needs to be wrapped such that any connection failure or timeout this
   * caught and emitted marking the 'service' offline.
   */
  end(callback) {
    let _this = this;
    if (_this.method === GET) {
      _this._get(_this.path, _this.headers, callback);
    } else if (_this.method === POST) {
      _this._post(_this.path, _this.body, _this.headers, callback);
    } else if (_this.method === PUT) {
      _this._put(_this.path, _this.body, _this.headers, callback);
    } else if (_this.method === PATCH) {
      _this._patch(_this.path, _this.body, _this.headers, callback);
    } else if (_this.method === DELETE) {
      _this._delete(_this.path, _this.body, _this.headers, callback);
    } else if (_this.method === HEAD) {
      _this._head(_this.path, _this.headers, callback);
    } else {
      callback(new Error(`Unsupported method ${this.method}`));
    }
  }

}

module.exports.ProxyAgent = ProxyAgent;
