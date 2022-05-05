const Eureka = require('eureka-js-client').Eureka;

// example configuration
const client = new Eureka({
    // application instance information
    instance: {
        app: 'document',
        // hostName: 'localhost',
        // ipAddr: '127.0.0.1',
        // port: 6000,
        vipAddress: 'document.com',
        dataCenterInfo: {
            name: 'MyOwn',
        },
    },
    eureka: {
        // eureka server host / port
        host: 'eureka-server',
        port: 8761,
    },
});

module.exports = client;