'use strict';

const proxy = require('./index.js');
const handler = (err, p) => {
  if(err) {
    console.log(err);
  } else {
    p.bind({types: ["DiscoveryService"]});
  }
}

proxy.connect({addr:'http://localhost:7616'}, handler);
