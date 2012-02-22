var request = require('superagent');
var config = require('../config');

var Usage = function(key) {
  if (!key || !key.length) {
        throw new TypeError('You must provide an API Key to ' +
        'create an instance of this class.');
    }
    this.apikey = key;
    this.url = config.baseurl + '/usage';
};

(function() {
    var apikeyHeader = config.apikey_header;

    /**
     * Returns detailed or totalized information
     * about sent and received messages.
     * @param {Object} filter An optinal filter object.
     * @param {Function} callback The callback function.
     *
     * The filter object should have the following properties:
     * {
     *       from: A String with an ISO8601 Date, indicating the initial
     *             date from where you want to make the query.
     *       to: A String with an ISO8601 Date indicating the end
     *             date.
     *       resource_id: A String with a resource id.
     *       swarm_id: A String with a swarm id.
     *       totalized: A Boolean indicating whether you want to get the
     *           total usage or not.
     *       page: A Number with the result page you want to get.
     *       count: The number of results you would like to get.
     *       orderby: A string with the name of the field by which you would like to sort the result.
     *       sort: A string with 'asc' or desc' that determines the order
of the result.
     *
     *  }
     *
     * @public
     **/
    this.get = function() {
        var filter, callback;
        var arglen = arguments.length;

        if (arglen > 2 || arglen < 1) {
            var arglen = arguments.length;
            throw new TypeError('Wrong number of arguments. ' +
            'In order to invoke this function you need ' +
            'to provide one or two arguments.');
        }

        if (arglen == 1) {
            callback = arguments[0];
            if (typeof callback !== 'function') {
                throw new TypeError('When invoking with one ' +
                'argument, a callback function is expected.');

            }
        } else if (arglen == 2) {
            filter = arguments[0];
            callback = arguments[1];

            if (typeof filter !== 'object' || 
                typeof callback !== 'function') {
                throw new TypeError('When invoking with two ' +
                'arguments, an object is expected as the first ' +
                'argument and a callback function as the second argument.');
            }

            /**
             * Workaround for superagent given that it
             * doesn't handle boolean values properly when
             * sending data through the query string.
             **/
            filter.totalized = filter.totalized ? 'true' : 'false';
        }

        var url = this.url;

        request
        .get(url + '/messages')
        .send(filter)
        .set(apikeyHeader, this.apikey)
        .end(function(res) {
            var err;
            if (res.status == 200) {
                callback(err, res.body);
            } else {
                err = res.body || res.text;
                callback(err);
            }
        });
    }
}).call(Usage.prototype);

module.exports = Usage;

