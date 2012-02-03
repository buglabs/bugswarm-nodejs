var bugswarm = require('bugswarm-cfg');
var ApiKeyService = bugswarm.ApiKeyService;
var SwarmService = bugswarm.SwarmService;
var ResourceService = bugswarm.ResourceService;

var Swarm = require('../bugswarm-prt').Swarm;

describe('Swarm participation API', function() {
    var cfgKey,
        partKey,
        resourceId,
        swarmId,
        prosumerId,
        consumerId;

    before(function(done) {
        var apikeyService = new ApiKeyService('librarytest', 'test');
        apikeyService.generate(function(err, data) {
            for(var i = 0, len = data.length; i < len; i++) {
                if(data[i].type == 'configuration') {
                    cfgKey = data[i].key;
                } else if(data[i].type == 'participation') {
                    partKey = data[i].key;
                }
            }

            var swarmService = new SwarmService(cfgKey);
            var resourceService = new ResourceService(cfgKey);

            var myswarm = {
                name: 'my swarm',
                public: false,
                description: 'my swarm description'
            };

            swarmService.create(myswarm, function(err, _swarm) {
                swarmId  = _swarm.id;
                var myresource = {
                    name: 'my resource',
                    description: 'my description',
                    machine_type: 'bug'
                };

                resourceService.create(myresource, function(err, _resource) {
                    resourceId = _resource.id;
                    var options = {
                        swarm_id: _swarm.id,
                        resource_id: _resource.id,
                        resource_type: 'producer'
                    };

                    swarmService.addResource(options, function(err) {
                        done();
                    });
                });
            });
        });
    });

    it('should allow to connect as a producer resource only', function(done) {
        var options = {
            apikey: partKey,
            resource: resourceId,
            swarms: swarmId
        };

        var producer = new Swarm(options);
        producer.on('message', function(message) {
            //we need to fail if this callback gets called.
            true.should.be.eql(false);
        });

        producer.on('error', function(err) {
            //we need to fail if this callback gets called.
            console.log(err);
            true.should.be.eql(false);
        });

        producer.on('connect', function(err) {
            producer.disconnect();
        });

        producer.on('presence', function(presence) {
            presence.from.resource.should.be.eql(resourceId);
        });

        producer.on('disconnect', function() {
            done();
        });

        producer.connect();
    });

    it('should allow to connect as a consumer resource only', function(done) {
        var swarmService = new SwarmService(cfgKey);
        var resourceService = new ResourceService(cfgKey);

        var myresource = {
            name: 'my consumer resource',
            description: 'my description',
            machine_type: 'bug'
        };

        resourceService.create(myresource, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            consumerId = _resource.id;

            swarmService.addResource(options, function(err) {
                var consumerOptions = {
                    apikey: partKey,
                    resource: _resource.id,
                    swarms: swarmId
                };

                var producerOptions = {
                    apikey: partKey,
                    resource: resourceId,
                    swarms: swarmId
                };

                var producer = new Swarm(producerOptions);
                var consumer = new Swarm(consumerOptions);

                consumer.on('message', function(message) {
                    message.from.swarm.should.be.eql(swarmId);
                    message.from.resource.should.be.eql(resourceId);
                    message.payload.should.be.eql('yo producer 1');
                    message.public.should.be.eql(true);
                    consumer.disconnect();
                    producer.disconnect();
                    done();
                });

                consumer.on('error', function(err) {
                    err[0].code.should.be.eql('056');
                    err[0].description.should.be.eql('Resource ' + consumerOptions.resource +
                    ' is not authorized to produce data in swarm ' + consumerOptions.swarms + '.');
                });

                consumer.on('presence', function(presence) {
                    //console.log(i + ') consumer received -> ' + JSON.stringify(presence));
                });

                consumer.on('connect', function() {
                    consumer.send('I should not be able to send this message');
                    //console.log('consumer ' + _resource.id + ' connected!');
                });

                consumer.connect();

                producer.on('message', function(message) {
                    //we need to fail if this callback gets called.
                    true.should.be.eql(false);
                });

                producer.on('presence', function(presence) {
                    if (presence.from.resource && 
                        !presence.type && //available
                        presence.from.resource == consumerOptions.resource) {
                        //lets send a message to the consumer once it shows up in
                        //the swarm.
                        producer.send('yo producer 1');
                    }
                    //console.log('producer received -> ' + JSON.stringify(presence));
                });

                producer.on('error', function(err) {
                    //we need to fail if this callback gets called.
                    true.should.be.eql(false);
                    producer.disconnect();
                });

                producer.on('connect', function() {
                    //console.log('producer ' + resourceId + ' connected!');
                });

                producer.connect();
            });
        });
    });

    it('should allow to connect a resource as producer and consumer', function(done) {
        var swarmService = new SwarmService(cfgKey);
        var resourceService = new ResourceService(cfgKey);

        var myresource = {
            name: 'my resource',
            description: 'This resource will produce and consume data.',
            machine_type: 'bug'
        };

        resourceService.create(myresource, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            prosumerId = _resource.id;

            swarmService.addResource(options, function(err) {

                options.resource_type = 'producer';

                swarmService.addResource(options, function(err) {
                    var options = {
                        apikey: partKey,
                        resource: _resource.id,
                        swarms: swarmId
                    };

                    var count = 0;
                    var prosumer = new Swarm(options);
                    prosumer.on('message', function(message) {
                        message.from.swarm.should.be.eql(swarmId);
                        message.from.resource.should.be.eql(_resource.id);
                        message.payload.should.be.eql('yo!');
                        count++;
                        if(count == 3) {
                            prosumer.disconnect();
                            done();
                        }
                    });

                    prosumer.on('presence', function(presence) {
                        if (presence.from.swarm &&
                            presence.from.swarm == swarmId &&
                            presence.from.resource == _resource.id) {

                            for (var i = 0; i < 4; i++) {
                                prosumer.send('yo!');
                            }
                        }
                    });

                    prosumer.on('error', function(err) {
                        true.should.be.eql(false);
                        prosumer.disconnect();
                    });

                    prosumer.connect();
                });
            });
        });
    });

    it('should send and receive private messages', function(done) {
        var options = {
            apikey: partKey,
            resource: prosumerId,
            swarms: swarmId
        };

        var options2 = {
            apikey: partKey,
            resource: consumerId,
            swarms: swarmId
        };

        var prosumer = new Swarm(options);
        var consumer = new Swarm(options2);

        prosumer.on('presence', function(presence) {
            if(presence.from.resource == consumerId) {
                for(var i = 0; i < 4; i++) {
                    prosumer.send({ message: 'yo in private!',
                                    swarms: swarmId,
                                    resource: consumerId });
                }
            }
        });

        var count = 0;
        consumer.on('message', function(message) {
            if (!message.public) {
                message.payload.should.be.eql('yo in private!');
                message.public.should.be.eql(false);
                message.from.swarm.should.be.eql(swarmId);
                message.from.resource.should.be.eql(prosumerId);
                count++;
                if(count == 3) {
                    consumer.disconnect();
                    prosumer.disconnect();
                    done();
                }
            }
        });

        consumer.connect();
        prosumer.connect();
    });

    it('should connect, join and send messages to more than one swarm',
    function(done) {
        var swarmService = new SwarmService(cfgKey);
        var resourceService = new ResourceService(cfgKey);

        var myswarm = {
            name: 'my swarm',
            public: false,
            description: 'le swarm'
        };

        swarmService.create(myswarm, function(err, swarm1) {
            swarmService.create(myswarm, function(err, swarm2) {
                var options = {
                    swarm_id: swarm1.id,
                    resource_id: prosumerId,
                    resource_type: 'producer'
                };

                swarmService.addResource(options, function(err) {
                    options.swarm_id = swarm2.id;
                    swarmService.addResource(options, function(err) {
                        options.resource_type = 'consumer';
                        swarmService.addResource(options, function(err) {
                            options.swarm_id = swarm1.id;
                            swarmService.addResource(options, function(err) {
                                var options = {
                                    apikey: partKey,
                                    resource: prosumerId,
                                    swarms: [swarm1.id, swarm2.id]
                                };

                                var prosumer = new Swarm(options);

                                prosumer.on('error', function(err) {
                                    console.log(err);
                                    true.should.be.eql(false);
                                });

                                var count = 0;
                                prosumer.on('presence', function(presence) {
                                    presence.from.resource.should.be.eql(prosumerId);

                                    if (presence.from.swarm == swarm1.id ||
                                        presence.from.swarm == swarm2.id) {
                                        count++;
                                        if(count == 2) {
                                            prosumer.send(count);
                                        }
                                    }
                                });

                                var count2 = 0;
                                prosumer.on('message', function(message) {
                                    count2++;
                                    message.from.resource.should.be.eql(prosumerId);
                                    message.payload.should.be.eql(2);
                                    if(count2 == 2) {
                                        done();
                                        prosumer.disconnect();
                                    }
                                });
                                prosumer.connect();
                            });
                        });
                    });
                });
            });
        });
    });

    it('should allow unregistered consumers if swarm is public', function(done) {
        /*var swarmService = new SwarmService(cfgKey);

        //create a public swarm
        var myswarm = {
            name: 'swarm name',
            public: true,
            description: 'My public swarm'
        };

        swarmService.create(myswarm, function(err, swarm) {
            var options = {
                apikey: partKey,
                resource: consumerId,
                swarms: swarm.id
            };

            var consumer = new Swarm(options);

            consumer.on('message', function(message) {
                console.log('message');
                console.log(message);
            });

            consumer.on('error', function(err) {
                //this callback shouldn't be called
                true.should.be.eql(false);
            });

            consumer.on('presence', function(presence) {
                console.log('presence');
                console.log(presence);
            });

            consumer.on('connect', function() {
                console.log('connected!');
            });

            consumer.connect();
        });*/
        done();
    });

    it('should support sending payloads bigger than 1500 bytes', function(done) {
        var options = {
            apikey: partKey,
            resource: prosumerId,
            swarms: swarmId
        };

        var prosumer = new Swarm(options);
        prosumer.on('error', function(err) {
            err.should.be.empty();
        });

        var message = '';
        for(var i = 0; i < 3000; i++) {
            message += i + ',';
        }

        prosumer.on('presence', function(presence) {
            if(presence.from.swarm == swarmId) {
                prosumer.send(message);
            }
        });

        prosumer.on('message', function(_message) {
            _message.payload.should.be.eql(message);
            done();
            prosumer.disconnect();
        });

        prosumer.connect();
    });

    it('should not miss messages if connection goes down')

    it('should re-connect if connection goes down')
});
