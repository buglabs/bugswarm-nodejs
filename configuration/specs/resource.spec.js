var ResourceService = require('../lib/resource');
var ApiKeyService = require('../lib/apikey');

describe('Resource service', function(){
    var resourceId;

    var apikeyService;
    var resourceService;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test');
        apikeyService.generate('configuration',
        function(err, apikey) {
            resourceService = new ResourceService(apikey.key);
            done();
        });
    });

    it('should create a resource', function(done) {
        var data = {
            name: 'my resource',
            description: 'my description',
            machine_type: 'bug'
        };

        resourceService.create(data, function(err, resource) {
            resource.should.be.a('object');

            resource.should.have.property('id');
            resourceId = resource.id;

            resource.name.should.be.eql('my resource');
            resource.description.should.be.eql('my description');
            resource.machine_type.should.be.eql('bug');
            resource.should.have.property('created_at');
            done();
        });
    });

    it('should get a specific resource by id', function(done) {
        resourceService.get(resourceId, function(err, resource) {
            resource.should.be.a('object');
            resource.should.have.property('id');
            resource.id.should.be.eql(resourceId);

            ['name', 'user_id', 'id', 'description', 'machine_type',
             'created_at'].forEach(function(p) {
                resource.should.have.property(p);
            });
            done();
        });
    });

    it('should update a resource', function(done) {
        resourceService.get(resourceId, function(err, _resource) {
            _resource.name = 'my resource modified';
            _resource.description = 'my description modified';
            _resource.machine_type = 'pc';

            resourceService.update(_resource, function(err, resource) {
                resource.should.be.a('object');
                resource.should.have.property('id');
                resource.id.should.be.eql(resourceId);
                resource.name.should.be.eql('my resource modified');
                resource.description.should.be.eql('my description modified');
                resource.machine_type.should.be.eql('pc');
                resource.should.have.property('created_at');
                resource.should.have.property('modified_at');
                done();
            });
        });
    });

    it('should get all the existing resources', function(done) {
        resourceService.get(function(err, resources) {
            Array.isArray(resources).should.be.eql(true);
            resources.length.should.be.above(0);
            resources.forEach(function(resource) {
                ['name', 'user_id', 'id', 'description', 'machine_type',
                'created_at'].forEach(function(p) {
                    resource.should.have.property(p);
                });
            });
            done();
        });
    });

    it('should return the list of swarms where the resource is ' +
    'a participant', function(done) {
        resourceService.swarms(resourceId, function(err, swarms) {
            Array.isArray(swarms).should.be.eql(true);
            swarms.length.should.be.eql(0);
            done();
        });
    });

    it('should destroy a resource', function(done) {
        resourceService.destroy(resourceId, function(err) {
            resourceService.get(resourceId, function(err, _resource) {
                var errors = err.errors;
                Array.isArray(errors).should.be.eql(true);
                errors[0].should.be.a('object');
                errors[0].description.should.be.eql('Resource not found.');
                done();
            });
        });
    });
});
