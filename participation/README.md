# BUGswarm participation NodeJS library

This library allows you to send and receive
messages and binary data to BUGswarm in realtime, communicate with resources within one swarm as well 
as resources spread out in different swarms.

This library is an implementation of 
[BUGswarm Participation API](http://developer.bugswarm.net/participation_api.html).

### Features
* Sends and receives private and public messages, as well as presence, 
  between swarms and resources.
* Sends and receives binary files.

### Installation
`npm install bugswarm-prt`

### Usage example

####Consuming data:

```javascript
var SwarmConnection = require('bugswarm-prt');

var options = {
    apikey: 'YOUR PARTICIPATION API KEY',
    resource: 'YOUR RESOURCE ID',
    //Keep in mind that your resource has to be a participant in all of these swarms.
    swarms: ['SWARM ID 1', 'SWARM ID 2'] 
};

var consumer = new SwarmConnection(options);
consumer.on('message', function(message) {
    console.log('message: ' + message);
});

consumer.on('error', function(err) {
    console.log(err);
});

consumer.on('connect', function(err) {
    console.log('Connected to the platform');
});

consumer.on('presence', function(presence) {
    console.log('presence: ' + presence);
});

consumer.on('disconnect', function() {
    console.log('disconnected');
});

//here is where the magic starts
consumer.connect();

```

####Producing data:

```javascript
var SwarmConnection = require('bugswarm-prt');

var options = {
    apikey: 'YOUR PARTICIPATION API KEY',
    resource: 'YOUR RESOURCE ID',
    //Keep in mind that your resource has to be a participant in all of these swarms.
    swarms: ['SWARM ID 1', 'SWARM ID 2'] 
};

var producer = new SwarmConnection(options);
var interval;

producer.on('connect', function(err) {
    /**
     * Sends a public message every 1 second.
     **/
    interval = setInterval(function() {
        producer.send('yo! in public');
    }, 1000);  
});

producer.on('disconnect', function() {
    clearInterval(interval);
});

producer.connect();

```

Take a look at the [documentation]() for details about the library API and, 
for more comprehensive usage, at the [specs](https://github.com/buglabs/bugswarm-api/tree/master/nodejs/participation/specs) directory. 

### Fork it, improve it and send us pull requests.
```shell
git clone git@github.com:buglabs/bugswarm-api.git && cd bugswarm-api/nodejs/participation
```

## License
(The MIT License)

Copyright 2011 BugLabs. All rights reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to
deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
sell copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
IN THE SOFTWARE.


