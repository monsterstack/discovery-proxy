'use strict';

const proxy = require('./index.js');

proxy.connect({addr:'http://localhost:7616'}, (p) => {
  p.bind({ types: ['FooService'] });
});
