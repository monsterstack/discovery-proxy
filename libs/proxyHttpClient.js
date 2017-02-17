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
            let request = self.unirest.get(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.end((response) => {
                resolve(response);
            })
        });

        return p;
    }

    put(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let request = self.unirest.put(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.send(body);
            request.end((response) => {
                resolve(response);
            });
        });

        return p;
    }

    post(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let request = self.unirest.post(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.send(body);
            request.end((response) => {
                resolve(response);
            });
        });

        return p;
    }

    delete(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let request = self.unirest.delete(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.send(body);
            request.end((response) => {
                resolve(response);
            });
        });

        return p;
    }

    head(path, headers) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let request = self.unirest.head(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.end((response) => {
                resolve(response);
            });
        });

        return p;
    }

    patch(path, headers, body) {
        let self = this;
        let p = new Promise((resolve, reject) => {
            let request = self.unirest.patch(path, headers);
            request.timeout(DEFAULT_TIMEOUT);
            request.end((response) => {
                resolve(response);
            });
        });

        return p;
    }
}

// Public
module.exports.ProxyHttpClient = ProxyHttpClient;