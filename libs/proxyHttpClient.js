'use strict';
const Promise = require('promise');
const unirest = require('unirest');

// Http Method Types
const POST = "POST".toLowerCase();
const PUT = "PUT".toLowerCase();
const GET = "GET".toLowerCase();
const DELETE = "DELETE".toLowerCase();
const PATCH = "PATCH".toLowerCase();
const HEAD = "HEAD".toLowerCase();

class ProxyHttpClient {
    constructor() {
        this.unirest = unirest;
    }

    request(method, url, headers, body) {
        let promise = null;
        if(method === POST) {
            promise = this.post(url, headers, body);
        } else if(method === PUT) {
            promise = this.put(url, headers, body);
        } else if(method === GET) {
            promise = this.get(url, headers);
        } else if(method === DELETE) {
            promise = this.delete(url, headers, body);
        } else if(method === PATCH) {
            promise = this.patch(url, headers, body);
        } else if(method === HEAD) {
            promise = this.head(url, headers);
        } else {
            promise = new Promise((resolve, reject) => {
                reject(new Error(`Unsupported Request Method ${method}`));
            });
        }

        return promise;
    }

    get(path, headers) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(GET.toUpperCase(), path, headers, null /* no body */, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }

    put(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(GET.toUpperCase(), path, headers, body, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }

    post(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(POST.toUpperCase(), path, headers, body, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }

    delete(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(DELETE.toUpperCase(),path, headers, body, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }

    head(path, headers) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(HEAD.toUpperCase(), path, headers, null /* no body */, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }

    patch(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            self.unirest(PATCH.toUpperCase(), headers, body, (error, response) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(response);
                }
            });
        });

        return p;
    }
}

// Public
module.exports.ProxyHttpClient = ProxyHttpClient;