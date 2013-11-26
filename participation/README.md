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

####Producing and consuming data:

```javascript
var Swarm = require('bugswarm-prt').Swarm;

var options = {
    apikey: 'YOUR PARTICIPATION API KEY',
    resource: 'YOUR RESOURCE ID WITH PERMISSIONS TO CONSUME AND PRODUCE',
    swarms: ['YOUR SWARM ID']
};

var prosumer = new Swarm(options);

prosumer.on('message', function(message) {
    console.log('message: ' + JSON.stringify(message));
});

prosumer.on('error', function(err) {
    console.log(err);
});

prosumer.on('connect', function(err) {
    console.log('Connected!');

    //Let's start sending random temperatures
    //from Central Park!
    setInterval(function() {
        prosumer.send(JSON.stringify({
            'temperature': Math.floor((Math.random() * 100) + 1)
        }));
    }, 2000);
});

prosumer.on('presence', function(presence) {
    console.log('presence: ' + JSON.stringify(presence));
});

prosumer.on('disconnect', function() {
    console.log('disconnected');
});

//here is where the execution flow starts
prosumer.connect();

```

Take a look at the [documentation]() for details about the library API and, 
for more comprehensive usage, at the [specs](https://github.com/buglabs/bugswarm-nodejs/tree/master/participation/specs) directory. 

### Fork it, improve it and send us pull requests.
```shell
git clone git@github.com:buglabs/bugswarm-nodejs.git && cd bugswarm-nodejs/participation
```

## License
(The MIT License)

Copyright 2013 BugLabs. All rights reserved.

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


