var util = require('util');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;
var config = require('../config');
var request = require('superagent');

var Binary = function(key) {
    if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'initialize this module.');
    }

    EventEmitter.call(this);

    this.apikey = key;

    this.uploadUrl = config.baseurl + '/upload';
    this.filesUrl = config.baseurl + '/files';
};

util.inherits(Binary, EventEmitter);

(function() {
    this.upload = function(file, swarmId, resourceId) {
        var self = this;

        fs.readFile(file, function(err, data) {
            if (err) {
                self.emit('error', err);
                return;
            }

            // superagent code
            request.post(self.uploadUrl)
            .set('x-bugswarmapikey', self.apikey)
            .part('resource_id', resourceId)
            .part('swarm_id', swarmId)
            .part('file', file)
            .end(function(res) {
                if (res.status != 201) {
                    self.emit('error', req.body.errors);
                } else {
                    self.emit('location', res.header['location']);
                }
            });
        });
    };

    this.download = function(file) {
        var self = this;
        request
        .get(self.filesUrl + '/' + file)
        .set('x-bugswarmapikey', self.apikey)
        .end(function(res) {
            if(res.status != 200) {
                self.emit('error', res.body.errors);
                return;
            }
            self.emit('file', res.text);
        });
    };
}).call(Binary.prototype);

module.exports = Binary;
