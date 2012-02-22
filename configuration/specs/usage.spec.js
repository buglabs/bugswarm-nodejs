var SwarmService = require('../lib/swarm');
var ResourceService = require('../lib/resource');
var ApiKeyService = require('../lib/apikey');
var UsageService = require('../lib/usage');

var bugswarmprt = require('bugswarm-prt');
var Prosumer = bugswarmprt.Swarm;

describe('Usage service', function() {
    var swarmId;
    var prosumerId;
    var cfgKey;
    var prtKey;

    var lastRecord = {};

    var apikeyService;
    var swarmService;
    var resourceService;
    var usageService;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test123');
        apikeyService.generate(function(err, keys) {
            for(var i in keys) {
                if(keys[i].type == 'configuration') {
                    cfgKey = keys[i].key;
                } else {
                    prtKey = keys[i].key;
                }
            }
            swarmService = new SwarmService(cfgKey);
            resourceService = new ResourceService(cfgKey);
            usageService = new UsageService(cfgKey);
            done();
        });
    });

    it('should prepare the environment for this test suite', function(done) {
        var data = {
            name: 'my swarm',
            public: false,
            description: 'my swarm description'
        };

        //creates swarm
        swarmService.create(data,
        function(err, swarm) {
            swarmId = swarm.id;

            var data = {
                name: 'my resource',
                description: 'my description',
                machine_type: 'bug'
            };

            //creates resource
            resourceService.create(data, function(err, resource) {
                var options = {
                    swarm_id: swarmId,
                    resource_id: resource.id,
                    resource_type: 'consumer'
                };

                prosumerId = resource.id;
                //adds resource as consumer
                swarmService.addResource(options, function(err) {
                    options.resource_type = 'producer';
                    //adds resource as producer
                    swarmService.addResource(options, function(err) {
                        done();
                    });
                });
            });
        });
    });

    it('should generate some messages', function(done) {
        var options = {
            apikey: prtKey,
            resource: prosumerId,
            swarms: swarmId
        };

        var prosumer = new Prosumer(options);
        prosumer.on('error', function(err) {
            assert.isUndefined(err);
            prosumer.disconnect();
        });

        prosumer.on('presence', function(presence) {
            if (presence.from.swarm) {
                presence.from.swarm.should.equal(swarmId);
                for (var i = 0; i < 3; i++) {
                    prosumer.send('hey!');
                }
            }
        });

        var j = 1;
        prosumer.on('message', function(message) {
            if (j == 3) {
                prosumer.disconnect();
            }
            j++;
        });

        prosumer.on('disconnect', function() {
            done();
        });

        prosumer.connect();
    });

    it('should return the total of sent and received messages between a given period of time.', function(done) {
        var from = new Date();
        from.setMinutes(0);
        from.setSeconds(0);
        from.setMilliseconds(0);
        from = from.toISOString();

        var to = new Date();
        to.setMinutes(59);
        to.setSeconds(59);
        to = to.toISOString();


        var filter = {
            totalized: true,
            resource_id: prosumerId,
            from: from,
            to: to
        };

        usageService.get(filter, function(error, data) {
            Array.isArray(data).should.be.false;
            Object.keys(data).should.not.be.empty;
            data.should.have.property('messages');
            data.messages.should.have.property('sent', 3);
            data.messages.should.have.property('received', 0);
            done();
        });
    });

    it('should return the user\'s usage detail', function(done) {
        usageService.get(function(error, data) {
            Array.isArray(data).should.be.true;
            data.length.should.be.above(0);
            for(var i in data) {
                data[i].user_id.should.eql('librarytest');
            }

            ['resource_id', 'swarm_id',
            'timestamp', 'user_id',
            'bytes', 'messages'].forEach(function(p) {
                data[0].should.have.property(p);
            });

            done();
        });
    });

    it('should return detailed information of the current month if no dates are provided', function(done) {
        usageService.get(function(error, data) {
            Array.isArray(data).should.be.true;
            data.length.should.be.above(0);

            var now = new Date();
            var cyear = now.getFullYear();
            var cmonth = now.getMonth();
            var cday = now.getDate();
            var chour = now.getHours();

            var currentMonth = new Date(cyear, cmonth).getTime();

            for(var i in data) {
                var timestamp = new Date(data[i].timestamp);
                var mtime = new Date(timestamp.getFullYear(),
                timestamp.getMonth()).getTime();

                currentMonth.should.eql(mtime);
            }
            done();
        });
    });
});
