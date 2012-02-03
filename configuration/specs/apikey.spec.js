var ApiKeyService = require('../lib/apikey');

describe('ApiKey service', function(){
    var apikeyService;
    var confkey;
    var partkey;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test');
        done();
    });

    it('should generate configuration and participation keys', function(done){
        apikeyService.generate(function(err, keys) {
            Array.isArray(keys).should.be.eql(true);
            keys.should.have.length(2);

            for(var i in keys) {
                ['user_id', 'created_at', 'status', 'type', 'key']
                .forEach(function(p) {
                   keys[i].should.have.property(p);
                });
                keys[i].should.not.have.property('_id');
            }
            done();
        });
    });

    it('should generate only the configuration key', function(done) {
        apikeyService.generate('configuration', function(err, key) {
            key.should.be.a('object');

            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });

            key.should.not.have.property('_id');
            key.type.should.be.eql('configuration');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);

            confkey = key.key;
            done();
        });
    });

    it('should generate only the participation key', function(done) {
        apikeyService.generate('participation', function(err, key) {
            key.should.be.a('object');

            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });

            key.should.not.have.property('_id');
            key.type.should.be.eql('participation');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);

            partkey = key.key;
            done();
        });
    });

    it('should return an error if key type is invalid', function(done) {
        apikeyService.generate('invalid_type', function(err, key) {
            Array.isArray(err).should.be.eql(true);
            err[0].message.should.be.eql('Instance is not one of the possible '+
            'values');
            err[0].attribute.should.be.eql('enum');
            err[0].details[0].should.be.eql('configuration');
            err[0].details[1].should.be.eql('participation');
            done();
        });
    });

    it('should return all the apikeys', function(done){
        apikeyService.get(function(err, keys) {
            Array.isArray(keys).should.be.eql(true);
            keys.should.have.length(2);

            for(var i in keys) {
                ['user_id', 'created_at', 'status', 'type', 'key']
                .forEach(function(p) {
                   keys[i].should.have.property(p);
                });
                keys[i].should.not.have.property('_id');
            }
            done();
        });
    });

    it('should return only the configuration key', function(done) {
        apikeyService.get('configuration', function(err, key) {
            key.should.be.a('object');

            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });

            key.should.not.have.property('_id');
            key.type.should.be.eql('configuration');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);

            key.key.should.be.eql(confkey);

            done();
        });
    });

    it('should return only the participation key', function(done) {
        apikeyService.get('participation', function(err, key) {
            key.should.be.a('object');

            ['user_id', 'created_at', 'status', 'type', 'key']
            .forEach(function(p) {
                key.should.have.property(p);
            });

            key.should.not.have.property('_id');
            key.type.should.be.eql('participation');
            key.key.should.have.lengthOf(40).and.match(/^[a-fA-F0-9]+$/);

            key.key.should.be.eql(partkey);

            done();
        });
    });
});
