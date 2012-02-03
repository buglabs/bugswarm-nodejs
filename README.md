# BUGswarm NodeJS library

This library has two main packages: participation and configuration. Use the
the configuration package to set up your swarms, resources as well as to manage 
invitations and API keys. Use the participation package to send and receive
messages and binary data.

These packages are an implementation of 
[BUGswarm API](http://developer.bugswarm.net/).

### Features
* Manages swarms, resources, invitations and apikeys.
* Sends and receives private and public messages, as well as presence, 
  between swarms and resources.
* Sends and receives binary files.

### Installation
#### [Configuration package](https://github.com/buglabs/bugswarm-api/tree/master/nodejs/configuration)
`npm install bugswarm-cfg`

#### [Participation package](https://github.com/buglabs/bugswarm-api/tree/master/nodejs/participation)
`npm install bugswarm-prt`


### Fork it, improve it and send us pull requests.
```shell
git clone git@github.com:buglabs/bugswarm-api.git && cd bugswarm-api/nodejs
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
