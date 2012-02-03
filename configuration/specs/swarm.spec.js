var SwarmService = require('../lib/swarm');
var ResourceService = require('../lib/resource');
var ApiKeyService = require('../lib/apikey');

describe('Swarm service', function(){
    var swarmId;
    var resource;

    var apikeyService;
    var swarmService;
    var resourceService;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test');
        apikeyService.generate('configuration',
        function(err, data) {
            swarmService = new SwarmService(data.key);
            resourceService = new ResourceService(data.key);
            done();
        });
    });

    it('should create a swarm', function(done) {
        var data = {
            name: 'my swarm',
            public: false,
            description: 'my swarm description'
        };

        swarmService.create(data, function(err, swarm) {
            swarm.should.be.a('object');

            swarm.should.have.property('id');
            swarmId = swarm.id;

            swarm.name.should.be.eql('my swarm');
            swarm.public.should.be.eql(false);
            swarm.description.should.be.eql('my swarm description');

            Array.isArray(swarm.resources).should.be.eql(true);
            swarm.resources.length.should.be.eql(0);
            swarm.should.have.property('created_at');
            swarm.should.have.property('user_id');
            done();
        });
    });

    it('should get information by swarm id', function(done) {
        swarmService.get(swarmId, function(err, swarm) {
            swarm.should.be.a('object');
            swarm.should.have.property('id');
            swarm.id.should.be.eql(swarmId);

            ['name', 'user_id', 'id', 'description', 'public',
             'created_at'].forEach(function(p) {
                swarm.should.have.property(p);
            });
            done();
        });
    });

    it('should update swarm information', function(done) {
         swarmService.get(swarmId, function(err, _swarm) {
            _swarm.name = 'my swarm modified';
            _swarm.description = 'my description modified';
            _swarm.public = true;

            swarmService.update(_swarm, function(err, swarm) {
                swarm.should.be.a('object');
                swarm.should.have.property('id');
                swarm.id.should.be.eql(swarmId);
                swarm.name.should.be.eql('my swarm modified');
                swarm.description.should.be.eql('my description modified');
                swarm.public.should.be.eql(true);
                swarm.should.have.property('created_at');
                swarm.should.have.property('modified_at');
                done();
            });
        });
    });

    it('should get all the existing swarms', function(done) {
        swarmService.get(function(err, swarms) {
            Array.isArray(swarms).should.be.eql(true);
            swarms.length.should.be.above(0);
            swarms.forEach(function(swarm) {
                ['name', 'user_id', 'id', 'description', 'public',
                 'created_at', 'resources'].forEach(function(p) {
                    swarm.should.have.property(p);
                });
            });
            done();
        });
    });

    it('should add a resource', function(done) {
        var data = {
            name: 'my resource',
            description: 'my description',
            machine_type: 'bug'
        };

        resourceService.create(data, function(err, _resource) {
            var options = {
                swarm_id: swarmId,
                resource_id: _resource.id,
                resource_type: 'consumer'
            };

            swarmService.addResource(options, function(err) {
                swarmService.get(swarmId, function(err, swarm) {
                    swarm.should.be.a('object');
                    swarm.should.have.property('resources');
                    Array.isArray(swarm.resources).should.be.eql(true);
                    swarm.resources.should.have.length(1);
                    var participant = swarm.resources[0];
                    participant.resource_type.should.be.eql(options.resource_type);
                    participant.resource_id.should.be.eql(options.resource_id);

                    ['resource_type', 'resource_id', 'member_since', 'url',
                     'user_id'].forEach(function(p) {
                        participant.should.have.property(p);
                    });

                    //global object
                    resource = {
                        id: _resource.id,
                        type: options.resource_type
                    };
                    done();
                });
            });
        });
    });

    it('should list swarm participants', function(done) {
        swarmService.resources(swarmId, function(err, resources) {
            Array.isArray(resources).should.be.eql(true);
            resources.should.have.length(1);
            done();
        });
    });

    it('should list consumer participants only', function(done) {
        swarmService.resources(swarmId, 'consumer', function(err, resources) {
            resources.forEach(function(r) {
                r.should.be.a('object');
                ['resource_type', 'resource_id', 'user_id',
                 'url', 'member_since'].forEach(function(p) {
                    r.should.have.property(p);
                });
                r.resource_type.should.be.eql('consumer');
                done();
            });
        });
    });

    it('should remove a resource', function(done) {
        var options = {
            swarm_id: swarmId,
            resource_id: resource.id,
            resource_type: resource.type
        };

        swarmService.removeResource(options, function(err) {
            swarmService.get(swarmId, function(err, swarm) {
                swarm.should.be.a('object');
                swarm.should.have.property('resources');
                Array.isArray(swarm.resources).should.be.eql(true);
                swarm.resources.should.have.length(0);
                done();
            });
        });
    });

    it('should list producer participants only', function(done) {
         var options = {
            swarm_id: swarmId,
            resource_id: resource.id,
            resource_type: 'producer'
        };

        swarmService.addResource(options, function(err) {
            swarmService.resources(swarmId, 'producer', function(err, resources) {
                resources.forEach(function(r) {
                    r.should.be.a('object');
                    ['resource_type', 'resource_id', 'user_id',
                    'url', 'member_since'].forEach(function(p) {
                        r.should.have.property(p);
                    });
                    r.resource_type.should.be.eql('producer');
                });
                done();
            });
        });
    });

    /*it('should send invitations', function(done) {
        done();
    });*/

    it('should destroy a swarm', function(done) {
        swarmService.destroy(swarmId, function(err) {
            swarmService.get(swarmId, function(err, swarm) {
                var errors = err.errors;
                Array.isArray(errors).should.be.eql(true);
                errors.should.have.length(1);
                errors[0].description.should.be.eql('Swarm not found.');
                done();
            });
        });
    });
});
