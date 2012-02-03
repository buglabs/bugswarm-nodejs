var InvitationService = require('../lib/invitation');
var ApiKeyService = require('../lib/apikey');
var SwarmService = require('../lib/swarm');
var ResourceService = require('../lib/resource');

describe('Invitation service', function() {
    //this is ugly, this test is a bit complex though.
    var swarmId;
    var resourceId;
    var apikeyService;
    var apikey2Service;
    var invitationService;
    var invitation2Service;
    var swarmService;
    var resourceService;
    var invitationId;

    before(function(done) {
        apikeyService = new ApiKeyService('librarytest', 'test');
        apikey2Service = new ApiKeyService('librarytest2', 'test');

        apikeyService.generate('configuration',
        function(err, apikey) {
            swarmService = new SwarmService(apikey.key);
            invitationService = new InvitationService(apikey.key);

            apikey2Service.generate('configuration',
            function(err, apikey2) {
                resourceService = new ResourceService(apikey2.key);
                invitation2Service = new InvitationService(apikey2.key);

                var data = {
                    name: 'my swarm',
                    public: false,
                    description: 'my swarm description'
                };

                swarmService.create(data, function(err, swarm) {
                    swarm.should.have.property('id');
                    swarmId = swarm.id;

                    var data = {
                        name: 'my resource',
                        description: 'my description',
                        machine_type: 'bug'
                    };

                    resourceService.create(data, function(err, resource) {
                        resource.should.have.property('id');
                        resourceId = resource.id;
                        done();
                    });
                });
            });
        });
    });

    it('should send invitations', function(done) {
        var _invitation = {
            to: 'librarytest2',
            resource_id: resourceId,
            resource_type: 'producer',
            description: 'Hey feel free to produce information in my Swarm.'
        };

        invitationService.send(swarmId, _invitation, function(err, invitation) {
            invitation.should.be.a('object');
            invitation.should.have.property('id');
            //invitationId = invitation.id;

            invitation.swarm_id.should.be.eql(swarmId);
            done();
        });
    });

    it('should get sent invitations by swarm', function(done) {
        invitationService.getSent(swarmId, function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
            invitations.length.should.be.above(0);
            invitations.forEach(function(i) {
                i.should.have.property('from');
                i.from.should.be.eql('librarytest');
                i.swarm_id.should.be.eql(swarmId);
            });
            done();
        });
    });

    /*it('should list all the sent invitations', function(done) {
        invitationService.get('sent', function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
           done();
        });
    });*/

    it('should get all the received invitations', function(done) {
        invitation2Service.getReceived(function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
            invitations.length.should.be.above(0);
            invitations.forEach(function(i) {
                i.should.have.property('to');
                i.to.should.be.eql('librarytest2');
            });
            done();
        });
    });

    it('should get received invitations by resource id', function(done) {
        invitation2Service.getReceived(resourceId, function(err, invitations) {
            Array.isArray(invitations).should.be.eql(true);
            invitations.length.should.be.above(0);
            invitations.forEach(function(i) {
                i.should.have.property('to');
                i.to.should.be.eql('librarytest2');
                i.resource_id.should.be.eql(resourceId);
                i.swarm_id.should.be.eql(swarmId);
                i.should.have.property('id');
                invitationId = i.id;
            });
            done();
        });
    });

    it('should reject invitations', function(done) {
        invitation2Service.reject(resourceId, invitationId,
        function(err, invitation) {
            invitation.should.be.a('object');
            invitation.should.have.property('status');
            invitation.status.should.be.eql('rejected');
            done();
        });
    });

    it('should accept invitations', function(done) {
         var _invitation = {
            to: 'librarytest2',
            resource_id: resourceId,
            resource_type: 'consumer',
            description: 'ok, join my swarm as consumer then.'
        };

        invitationService.send(swarmId, _invitation, function(err, invitation) {
            invitation.should.be.a('object');
            invitation.should.have.property('id');

            invitation2Service.accept(resourceId, invitation.id,
            function(err, invitation) {
                invitation.should.be.a('object');
                invitation.should.have.property('status');
                invitation.status.should.be.eql('accepted');
                done();
            });
        });
    });
});
