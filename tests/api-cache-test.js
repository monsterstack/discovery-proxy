'use strict';
const ApiCache = require('../libs/apiCache').ApiCache;

describe('api-cache-test', (done) => {
    let apiCache = new ApiCache({ttl: 5});
    beforeEach((done) => {
        apiCache.set('ffff', {
            msg: 'hello'
        }).then(() => {
            done();
        }).catch((err) => {
            done(err);
        });
    });


    it('api cache entry should expire in 5 seconds', (done) => {
        setTimeout(() => {
            apiCache.get('ffff').then((entry) => {
                if(entry) done(new Error('Expected null due to expired entry'));
                else done();
            }).catch((err) => { done(err); });
        }, 6*1000);
    }).timeout(8*1000);

    it('api cache entry should be available at 4 seconds', (done) => {
        setTimeout(() => {
            apiCache.get('ffff').then((entry) => {
                if(entry) done();
                else done(new Error('Expected entry to still be available prior to ttl'));
            }).catch((err) => { done(err); });
        }, 4*1000);
    }).timeout(8*1000);
});