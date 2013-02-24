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

        if (Array.isArray(swarms)) {
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
                var messages = buffer.split('\r\n');
                var len = messages.length;
                if (!len) { return; }

                for (var m = 0; m < len; m++) {
                    var msg = messages[m];
                    //doesn't emit keepalive packets
                    if (!msg.trim().length) {
                        continue;
                    }

                    try {
                        self.emit('message', JSON.parse(msg));
                    } catch(e) {
                        buffer = msg;
                        return;
                    }
                }
                buffer = '';
            });
        });

        this.req.on('socket', function(socket) {
            socket.on('connect', function() {
                /**
                 * GOTCHA!
                 * There is an issue here
                 * between the socket and the
                 * state of http.ClientRequest.
                 * ClientRequest is in a bad state when socket
                 * connects causing a hang up
                 * when users try to send data inmediately
                 * after 'connect' is emitted.
                 * We need to make our users aware
                 * of attempting to send data
                 * upon presence arrival instead.
                 **/
                self.connected = true;
                self.emit('connect');
            });

            socket.on('end', function(e) {
                self.connected = false;
                self.emit('disconnect');
            });

            socket.on('close', function() {
                self.connected = false;
                self.emit('disconnect');
            });
        });

        this.req.on('error', function(err) {
            throw err;
            //self.connected = false;
            //self.emit('disconnect');
            //console.log('initiating reconnection algorithm...');
            //TODO Reconnections http://www.w3.org/Protocols/rfc2616/rfc2616-sec8.html
            //TODO use circular queue to reduce the amount
            //packets being lost when disconnected.
        });

        //initiates connection
        this.req.write('\n');
    };

    this.send = function(message) {
        if (!this.connected) {
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
        if (this.connected) {
            this.req.end();
        }
    };
}).call(Connection.prototype);

module.exports = Connection;
