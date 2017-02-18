'use strict';

const assert = require('assert');
//const requestAgent = require('superagent-extend');
const RequestAgent = require('../libs/proxyAgent').ProxyAgent;
const URL = "http://www.google.com?hello=ff";

/**
 * Agent Response Interceptor
 */
describe('agent-response-intc', () => {
   

    it('proxy agent response', (done) => {
        let performance;

        let requestAgent = new RequestAgent();
        requestAgent.addResIntc((res) => {
            console.log(res.performance);
            performance = res.performance;
        });

        // This is how swagger-client makes the call
        requestAgent.get(URL).send().end((err, res) => {
            if(err) {
                done(err);
            } else if(performance) {
                done();
            } else {
                done(new Error("Failed to get performance"))
            }
        
        })
    });

});