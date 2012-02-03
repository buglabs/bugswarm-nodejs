var CircularQueue = module.exports = function(size) {
    this.maxsize = size || 10000;
};

(function() {
    var fp = 0; //front pointer
    var rp = 0; //rear pointer
    var qs = 0; //size of queue
    var queue = [this.maxsize]; //actual queue

    this.remove = function() {
        qs--;
        fp = (fp + 1) % this.maxsize;
        return queue[fp];
    };

    this.add = function(item) {
        qs++;
        rp = (rp + 1) % this.maxsize;
        queue[rp] = item;
    };

    this.isEmpty = function() {
        return qs === 0;
    };

}).call(CircularQueue.prototype);
