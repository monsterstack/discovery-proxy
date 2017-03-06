'use strict';
const PicoDB = require('picodb');

describe('pico-insert-test', (done) => {
    let db = PicoDB.Create();
    before((done) => {
        db.insertOne({_id:'dddd', message:'foo'}, (err, doc) => {
            if(err) done(err);
            else done();
        });
    });

    it('insert with duplicate key results in overwritten entry', (done) => {
        db.insertOne({_id:'dddd', message:'foo'}, (err, doc) => {
            if(err) done(err);
            else {
                db.count({'_id':'dddd'}, (err, num) => {
                    if(err) done(err);
                    else {
                        if(num == 1) done();
                        else done(new Error('Expecting only one entry matching `{id:\'dddd\'}`'));
                    }
                });
            }
        });
    });
});