'use strict';

const assert = require('assert');
const requestAgent = require('superagent-extend');

/**
 * Agent Response Interceptor
 */
describe('agent-response-intc', () => {

    it('response performance', (done) => {
        let performance;
        requestAgent.util.addResIntc((res) => {
            performance = res.performance;
        });

        requestAgent.request['get']('http://www.google.com').done().then((res) => {
            if(performance) {
                console.log(performance);
                done();
            } else {
                done(new Error("Failed to get performance"))
            }
        
        }).catch((err) => {
          done(err);  
        });
    });

});