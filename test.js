'use strict';

const proxy = require('./index.js');
const handler = (err, p) => {
  if(err) {
    console.log(err);
  } else {
    p.bind({types: ["DiscoveryService"]});

    // setTimeout(() => {
    //   p.findOneAvailableByType("DiscoveryService").then((service) => {
    //     p.apiForService(service).then((api) => {
    //       console.log(api);
    //     }).catch((err) => {
    //       console.log(err);
    //     })
    //   });
    // }, 5000);
  }
}

proxy.connect({addr:'http://localhost:7616'}, handler);
