'use strict';

const assert = require('assert');
const RequestAgent = require('../libs/proxyAgent').ProxyAgent;

/**
 * Agent Response Interceptor
 */
describe('agent-response-intc', () => {

    it('proxy agent response', (done) => {
        let performance;

        let requestAgent = new RequestAgent();
        requestAgent.addResIntc((res) => {
            performance = res.performance;
        });

        let url = 'http://www.google.com?hello=ff';

        // This is how swagger-client makes the call
        requestAgent.get(url).send().end((err, res) => {
            if (err) {
                done(err);
            } else if (performance) {
                done();
            } else {
                done(new Error('Failed to get performance'));
            }
        });
    });

    it('proxy agent emits connectionError', (done) => {
        let requestAgent = new RequestAgent();
        let connectionErrorOccured = false;
        requestAgent.onConnectionError((connectionErrEvent) => {
            connectionErrorOccured = true;
        });

        let url = 'http://foo.baz/';
        requestAgent.get(url).send().end((err, res) => {
            if(connectionErrorOccured) {
                done();
            } else {
                done(new Error('Connection Error event never received'));
            }
        });
    }).timeout(135000);
});
