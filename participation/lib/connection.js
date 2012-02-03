var EventEmitter = require('events').EventEmitter;
var Queue = require('./queue');
var config = require('../config');

var http = require('http');
var util = require('util');

var Connection = function() {
    this.connected = false;
    this.req = undefined;
    this.queue = new Queue(100000);

    EventEmitter.call(this);
};

util.inherits(Connection, EventEmitter);

(function() {
    this.connect = function(options) {
        var self = this;
        var streamcfg = {};
        for(var i in config.stream) {
            streamcfg[i] = config.stream[i];
        }

        var path = streamcfg.path;
        path += '?resource_id=' + options.resource;

        var swarms = options.swarms;

        if(Array.isArray(swarms)) {
            for(var j in swarms) {
                path += '&swarm_id=' + swarms[j];
            }
        } else {
            path += '&swarm_id=' + swarms;
        }

        streamcfg.headers = {};
        streamcfg.headers[config.apikey_header] = options.apikey;
        streamcfg.method = 'POST';
        streamcfg.path = path;

        //console.log(streamcfg);
        this.req = http.request(streamcfg, function(res) {
            var buffer = '';
            res.on('data', function (chunk) {
                chunk = chunk + '';

                buffer += chunk;
                if (!chunk.match(/\r\n$/)) {
                    return;
                }
                try {
                    self.emit('message', JSON.parse(buffer));
                } catch(e) {
                    console.log(e.stack);
                    console.log('Malformed message, not a valid JSON ' +
                    'structure: ---->' + buffer + '<----');
                } finally {
                    buffer = '';
                }
            });
        });

        this.req.on('socket', function(socket) {
            socket.on('connect', function() {
                self.connected = true;
                self.emit('connect');
            });

            socket.on('error', function(err) {
                console.log('socket connection error: ');
                console.log(err.stack);
                //self.emit('error', err);

                console.log('initiating reconnection algorithm...');
                //TODO Reconnections http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
                //TODO use circular queue to reduce the amount
                //packets being lost when disconnected.
            });

            socket.on('close', function() {
                self.connected = false;
                self.emit('disconnect');
            });
        });

        //initiates connection
        this.req.write('\n');
    };

    this.send = function(message) {
        if(!this.connected) {
            this.emit('error', {errors:
                [ { code:'000',
                    description: 'There is not an open connection with ' +
                    'Swarm server. Please try again.'
                }]
            });
            return;
        }

        try {
            message = JSON.stringify(message);
        } catch(e) {
            this.emit('error', e);
        }
        //queue.add(stanza);
        this.req.write(message + '\r\n');
    };

    this.disconnect = function() {
        try {
            this.req.end();
        } catch(e) {
            console.log(e.stack);
        }
    };
}).call(Connection.prototype);

module.exports = Connection;
