var request = require('superagent');
var config = require('../config');

var Resource = function(key) {
    if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'call this constructor.');
    }
    this.apikey = key;
    this.url = config.baseurl + '/resources';
};

(function() {
    var apikeyHeader = config.apikey_header;

    this.create = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var data = arguments[0];
        if (typeof data !== 'object') {
            throw new TypeError('A object is expected as ' +
            'first argument.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .post(this.url)
        .set(apikeyHeader, this.apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 201) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    this.update = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var data = arguments[0];
        if (typeof data !== 'object' || !data.id || !data.id.length) {
            throw new TypeError('A object is expected as ' +
            'first argument and it has to include an id property of '+
            'the resource to be updated.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        /**
         * Server complains if we send
         * additional parameters for updates.
         **/
        var id = data.id;

        ['id', 'created_at', 'modified_at', 'user_id']
        .forEach(function(p) {
            delete data[p];
        });

        request
        .put(this.url + '/' + id)
        .set(apikeyHeader, this.apikey)
        .data(data)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    this.swarms = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var id = arguments[0];
        if (typeof id !== 'string' || !id.length) {
            throw new TypeError('A nonempty resource id string is expected as ' +
            'first argument in order to get the list of swarms where the ' +
            'the resource is participating.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .get(this.url + '/' + id + '/swarms')
        .set(apikeyHeader, this.apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    this.get = function(){
        var id, callback;

        var arglen = arguments.length;
        if (arglen > 2 || arglen < 1) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide at least one and ' +
            'maximum two arguments.');
        }

        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one argument, a ' +
                'callback function is expected as the first ' +
                'argument.');
            }
        } else if (arglen == 2) {
            id = arguments[0];
            callback = arguments[1];
            if (typeof id !== 'string' ||
                !id.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a resource id as the first argument is expected '+
                'and a callback function as the second argument.');
            }
        }

        var url = this.url;

        request
        .get(id ? url + '/' + id : url)
        .set(apikeyHeader, this.apikey)
        .end(function(err, res) {
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };

    this.destroy = function(){
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var id = arguments[0];
        if (typeof id !== 'string' || !id.length) {
            throw new TypeError('A nonempty string is expected as ' +
            'first argument and it should be the resource id to be destroyed.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .del(this.url + '/' + id)
        .set(apikeyHeader, this.apikey)
        .end(function(err, res) {
            if (res.status == 204) {
                callback();
            } else {
                if (!err) {
                    err = res.body || res.text;
                }
                callback(err);
            }
        });
    };
}).call(Resource.prototype);

module.exports = Resource;
