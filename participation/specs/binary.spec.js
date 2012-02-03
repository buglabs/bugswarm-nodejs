var bugswarm = require('bugswarm-cfg');
var ApiKeyService = bugswarm.ApiKeyService;
var SwarmService = bugswarm.SwarmService;
var ResourceService = bugswarm.ResourceService;
var config = require('../config');
var crypto = require('crypto');
var fs = require('fs');

var Binary = require('../bugswarm-prt').Binary;

describe('Binary API', function() {
    var partKey,
        cfgKey,
        binary,
        resourceId,
        swarmId;

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
                        binary = new Binary(cfgKey);
                        done();
                    });
                });
            });
        });
    });

    it('should upload files to BUGswarm', function(done) {
        binary.on('error', function(err) {
            err.should.be.empty();
        });

        binary.on('location', function(location) {
            location.should.be.eql(config.baseurl + '/files/commando.jpg');
            done();
        });

        binary.upload(__dirname + '/fixtures/commando.jpg', swarmId, resourceId);
    });

    it('should download received files from BUGswarm', function(done) {
        binary.on('error', function(err) {
            err.should.be.empty();
        });

        binary.on('file', function(file) {
            var shasum1 = crypto.createHash('sha1');
            shasum1.update(file);
            var digest1 = shasum1.digest('hex');


            var shasum2 = crypto.createHash('sha1');
            var s = fs.ReadStream(__dirname + '/fixtures/commando.jpg');
            s.on('data', function(d) {
                shasum2.update(d);
            });

            s.on('end', function() {
                var digest2 = shasum2.digest('hex');
                digest1.should.be.eql(digest2);
                done();
            });
        });

        binary.download('commando.jpg');
    });
});
