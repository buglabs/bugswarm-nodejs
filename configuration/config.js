var config = {
    development: {
        baseurl: 'http://localhost:8005',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.dev.bugswarm.net',
            port: 80,
            path: '/stream'
        },
        debug: true
    },

    integration: {
        baseurl: 'http://localhost:8005',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'localhost',
            port: 8002,
            path: '/stream'
        },
        debug: true
    },

    test: {
        baseurl: 'http://localhost:8005',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.test.bugswarm.net',
            port: 80,
            path: '/stream'
        },
        debug: true
    },

    production: {
        baseurl: 'http://api.bugswarm.net',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.bugswarm.net',
            port: 80,
            path: '/stream'
        },
        debug: false
    }
};
var env = process.env.NODE_ENV || 'development';
module.exports = config[env];
