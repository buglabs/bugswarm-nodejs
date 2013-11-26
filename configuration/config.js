var config = {
    development: {
        baseurl: 'http://api.dev.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.dev.bugswarm.com',
            port: 80,
            path: '/stream'
        },
        debug: true
    },

    staging: {
        baseurl: 'http://api.staging.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.staging.bugswarm.com',
            port: 80,
            path: '/stream'
        },
        debug: true
    },

    test: {
        baseurl: 'http://api.test.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.test.bugswarm.com',
            port: 80,
            path: '/stream'
        },
        debug: true
    },

    production: {
        baseurl: 'http://api.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'api.bugswarm.com',
            port: 80,
            path: '/stream'
        },
        debug: false
    }
};
var env = process.env.NODE_ENV || 'production';
module.exports = config[env];
