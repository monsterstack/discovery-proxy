'use strict';

const proxy = require('./index.js');

proxy.connect({addr:'http://localhost:7616'}, (err, p) => {
  if(err) {
    console.log(err);
  } else {
    p.bind({ types: ['DiscoveryService'] });
  }
});
