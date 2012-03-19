var config = {
    development: {
        baseurl: 'http://api.dev.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'stream.dev.bugswarm.com',
            port: 80,
            path: '/stream',
            agent: false
        },
        debug: true
    },

    integration: {
        baseurl: 'http://api.int.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'stream.int.bugswarm.com',
            port: 80,
            path: '/stream',
            agent: false
        },
        debug: true
    },

    test: {
        baseurl: 'http://api.test.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'stream.test.bugswarm.com',
            port: 80,
            path: '/stream',
            agent: false
        },
        debug: true
    },

    production: {
        baseurl: 'http://api.bugswarm.com',
        apikey_header: 'x-bugswarmapikey',
        stream: {
            host: 'stream.bugswarm.com',
            port: 80,
            path: '/stream',
            agent: false
        },
        debug: false
    }
};
var env = process.env.NODE_ENV || 'development';
module.exports = config[env];
