var request = require('superagent');
var config = require('../config');

var SwarmService = require('./swarm');

var Invitation = function(key) {
    if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'initialize this module.');
    }
    this.apikey = key;

    this.resourceUrl = config.baseurl + '/resources';
    this.invitationUrl = config.baseurl + '/invitations';
    this.swarmsUrl = config.baseurl + '/swarms';
};

(function() {
    var apikeyHeader = config.apikey_header;

    this.send = function() {
        var arglen = arguments.length;
        if (arglen !== 3) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide three arguments.');
        }

        var swarmId = arguments[0];
        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('A nonempty swarm id string is expected as ' +
            'first argument.');
        }

        var invitation = arguments[1];
        if (typeof invitation !== 'object') {
            throw new TypeError('An object is expected as the second ' +
            'argument.');
        }

        var callback = arguments[2];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'third argument.');
        }

        request
        .post(this.swarmsUrl + '/' + swarmId + '/invitations')
        .set(apikeyHeader, this.apikey)
        .data(invitation)
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

    this.getSent = function() {
        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        var swarmId = arguments[0];
        if (typeof swarmId !== 'string' ||
            !swarmId.length) {
            throw new TypeError('A nonempty swarm id string is expected as ' +
            'first argument.');
        }

        var callback = arguments[1];
        if (typeof callback !== 'function') {
            throw new TypeError('A callback function is expected as the ' +
            'second argument.');
        }

        request
        .get(this.swarmsUrl + '/' + swarmId + '/invitations')
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

    this.getReceived = function() {
        var resourceId, callback;

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
            resourceId = arguments[0];
            callback = arguments[1];
            if (typeof resourceId !== 'string' ||
                !resourceId.length ||
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two arguments, a ' +
                'string with a resource id as the first argument is expected '+
                'and a callback function as the second argument.');
            }
        }

        var url = resourceId ?
                this.resourceUrl + '/' + resourceId + '/invitations'
                : this.invitationUrl;

        request
        .get(url)
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

    var actions = ['accept', 'reject'];
    for(var i = 0, len = actions.length; i < len; i++) {
        var action = actions[i];
        this[action] = (function(action) {

            return function() {
                var arglen = arguments.length;
                if (arglen !== 3) {
                    throw new TypeError('Wrong number of arguments. In order to ' +
                    'invoke this function you need to provide two arguments.');
                }

                var resourceId = arguments[0];
                if (typeof resourceId !== 'string' ||
                    !resourceId.length) {
                    throw new TypeError('A nonempty resource id string is ' +
                    'expected as first argument.');
                }

                var id = arguments[1];
                if (typeof id !== 'string' ||
                    !id.length) {
                    throw new TypeError('A nonempty invitation id string is ' +
                    'expected as second argument.');
                }

                var callback = arguments[2];
                if (typeof callback !== 'function') {
                    throw new TypeError('A callback function is expected as the ' +
                    'third argument.');
                }

                var url = this.resourceUrl + '/' + resourceId + '/invitations/' + id;
                request
                .put(url)
                .set(apikeyHeader, this.apikey)
                .data({status: action})
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
        })(action)
    }
}).call(Invitation.prototype);

module.exports = Invitation;

