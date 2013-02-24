/*jslint node: true */
'use strict';

var request = require('superagent');
var config = require('../config');

var History = function(key) {
	if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'create an instance of this function.');
    }
    this.apikey = key;
    this.url = config.baseurl + '/logs';
};

(function() {
	var apikeyHeader = config.apikey_header;

	this.get = function() {
		var swarms, callback;

        var arglen = arguments.length;
        if (arglen !== 2) {
            throw new TypeError('Wrong number of arguments. In order to ' +
            'invoke this function you need to provide two arguments.');
        }

        swarms = arguments[0];
        swarms = Array.isArray(swarms) ? swarms : [swarms];
        callback = arguments[1];
		if (typeof callback !== 'function') {
			throw new TypeError('A callback function is expected as ' +
			'the second argument.');
        }

        var query = '';
        for (var s = 0, len = swarms.length; s < len; s++) {
			query += '&swarm_id=' + swarms[s];
        }

        var url = this.url;

        request
        .get(url)
        .query(query)
        .set(apikeyHeader, this.apikey)
        .end(function(res) {
            var err;
            if (res.status === 200) {
                callback(err, res.body);
            } else {
                err = res.body || res.text;
                callback(err);
            }
        });
    };
}).call(History.prototype);

module.exports = History;