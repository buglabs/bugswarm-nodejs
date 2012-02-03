var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Connection = require('./connection');

var Swarm = function(options) {
    this.conn = new Connection();
    this.options = {apikey: '',
                    resource: '',
                    swarms: ''};

    EventEmitter.call(this);

    if (!options.apikey) {
        throw new Error('You must provide a Participation API ' +
        'Key in order to join Swarms. Please go to ' +
        'http://developer.bugswarm.net/restful_api_keys.html#create ' +
        'to know how to create your API Keys.');
    }

    if (!options.resource) {
        throw new Error('You must provide a resource id ' +
        'in order to join Swarms. Please go to ' +
        'http://developer.bugswarm.net/restful_user_resources.html#create' +
        ' to know how to create your resources and ' +
        'http://developer.bugswarm.net/restful_swarm_resources.html#add ' +
        'for instructions about how to add your resource ' +
        'to your existing Swarm.');
    }

    if (!options.swarms ||
        (Array.isArray(options.swarms) && !options.swarms.length)) {
        throw new Error('You need to specify which ' +
        'Swarm(s) you would like to join. Please go to ' +
        'http://developer.bugswarm.net/restful_swarms.html#create ' +
        'if you want to know how to create them.');
    }

    for(var i in this.options) {
        if(options[i]) {
            this.options[i] = options[i];
        }
    }
};

util.inherits(Swarm, EventEmitter);

(function() {
    this.connect = function() {
        var self = this;

        this.conn.on('message', function(stanza) {
            if(stanza.message) {
                self.emit('message', stanza.message);
            } else if(stanza.presence) {
                self.emit('presence', stanza.presence);
            } else if(stanza.errors) {
                self.emit('error', stanza.errors);
            }
        });

        this.conn.on('connect', function() {
            self.emit('connect');
        });

        this.conn.on('error', function(err) {
            console.log(self._events);
            self.emit('error', err);
        });

        this.conn.on('disconnect', function() {
            self.emit('disconnect');
        });

        this.conn.connect(this.options);
    };

    /**
     * @private
     **/
    function presence(swarms, type) {
        if(!swarms || !swarms.length) {
            throw new TypeError('Wrong parameters, you must provide at least ' +
            'one swarm.');
        }

        if(!Array.isArray(swarms)) {
            swarms = [swarms];
        }

        var stanza = {presence: {to: swarms}};

        if(type && type === 'unavailable') {
            stanza.presence.type = type;
        }

        this.conn.send(stanza);
    }

    this.join = function(swarms) {
        presence.call(this, swarms);
    };

    this.leave = function(swarms) {
        presence.call(this, swarms, 'unavailable');
    };


    /**
     *
     * {swarms: '',
     *  resource: '',
     *  message: ''};
     *
     * or
     *
     * {swarm: '',
     *  message: ''}
     *
     * or
     *
     * message
     **/
    this.send = function(options) {
        var swarms;
        var message;
        var resource;

        if(typeof options === 'object') {
            swarms = options.swarms;
            message = options.message;
            resource = options.resource;
        } else {
            message = options;
        }

        var to = [];
        var stanza = {message: {}};

        if (swarms) {
            if (resource && !resource.length) {
                return new TypeError('Resource should not be empty if ' +
                'specified.');
            }

            if(!Array.isArray(swarms)) {
                swarms = [swarms];
            }

            for(var i = 0, len = swarms.length; i < len; i++) {
                if(resource) {
                    to.push({resource: resource, swarm: swarms[i]});
                } else {
                    to.push(swarms[i]);
                }
            }
            stanza.message.to = to;
        }

        stanza.message.payload = message;

        this.conn.send(stanza);
    };

    this.disconnect = function() {
        this.conn.disconnect();
    };
}).call(Swarm.prototype);

module.exports = Swarm;
