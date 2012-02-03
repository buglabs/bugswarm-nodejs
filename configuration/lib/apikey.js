var request = require('superagent');
var config = require('../config');

var ApiKey = function(username, password) {
     if (!username || !username.length ||
         !password || !password.length) {
            throw new TypeError('You must provide a username and password ' +
            'to initialize this module.');
    }

    this.auth = 'Basic ' +
        new Buffer(username + ':' + password).toString('base64');
    this.url = config.baseurl + '/keys';
};

(function() {
    this.generate = function() {
        var type, callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 2) {
            type = arguments[0];
            callback = arguments[1];
            if (typeof type !== 'string' ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a API key type is expected as the first ' +
                'argument and a callback function as the second argument.');
            }
        } else if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        var url = this.url;

        request
        .post(type ? url + '/' + type : url)
        .set('Authorization', this.auth)
        .end(function(err, res) {
            if (res.status == 201) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body;
                }
                callback(err);
            }
        });
    };

    this.get = function() {
        var type, callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 2) {
            type = arguments[0];
            callback = arguments[1];
            if (typeof type !== 'string' ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a API key type is expected as the first ' +
                'argument and a callback function as the second argument.');
            }
        } else if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected.');
            }
        }

        var url = this.url;

        request
        .get(type ? url + '/' + type : url)
        .set('Authorization', this.auth)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body;
                }
                callback(err);
            }
        });
    };

}).call(ApiKey.prototype);

module.exports = ApiKey;
