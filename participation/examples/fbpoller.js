/**
 *
 * Dependencies installation
 *
 * npm install superagent bugswarm-prt
 *
 * More info about Superagent API can be found at:
 * http://visionmedia.github.com/superagent/
 *
 *
 * This example pulls the Facebook Graph API every second
 * in order to notify to a swarm upon FBLikes increments.
 *
 * For developers not familiar with node.js and its
 * event driven nature, there are
 * some numeric marks (//1, //2, //3, //4, etc),
 * that represent the flow of execution of this example.
 */


process.env.NODE_ENV = 'production';

var request         = require('superagent');
var Swarm           = require('bugswarm-prt').Swarm;

var API_KEY         = "YOUR API KEY";
var SWARM_ID        = "YOUR SWARM ID";
var RESOURCE_ID     = "YOUR RESOURCE ID";

var options = {
    apikey: API_KEY,
    resource: RESOURCE_ID,
    swarms: [SWARM_ID]
};

var likecount = 0;
var interval = null;
var producer = new Swarm(options);

producer.on('connect', function() {
    //2
    console.log('Connected to swarm!');
    console.log('Starting facebook poller...');

    if (interval) {
        clearInterval(interval);
    }

    interval = setInterval(fbpoller, 1000);
});


function fbpoller() {
    //3
    request
        .get('http://graph.facebook.com/391245657633942')
        .set('Accept', 'application/json')
        .end(function(res) {
            //4
            var data = res.body;
            var currentLikes = parseInt(data.likes, 10);

            if (likecount < currentLikes) {
                likecount = currentLikes;
                console.log('notifying fblikes increment... ' + likecount);
                producer.send(JSON.stringify({'printrequest': true}));
            }
        });
}

producer.on('disconnect', function() {
    console.log("disconnected from swarm?!");
    console.log('exiting...');
    process.exit();
});

producer.on('presence', function(p) {
    //console.log(p);
});

producer.on('error', function(error) {
    console.log(error);
});

//1. execution flow starts here
producer.connect();

//Disconnects smoothly from Swarm server upon program termination
['SIGINT', 'SIGTERM'].forEach(function(signal){
    process.on(signal, function(){
        producer.disconnect();
    });
});