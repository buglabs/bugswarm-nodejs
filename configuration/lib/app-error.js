'use strict';

var util = require('util');

function AppError(str) {
    this.str = str;

    Error.call(this);
    Error.captureStackTrace(this, AppError);
}

util.inherits(AppError, Error);

AppError.prototype.toString = function() {
    return this.str;
};

AppError.prototype.toObject = function() {
    try {
        return JSON.parse(this.str);
    } catch(e) {
        return this.str;
    }
};

module.exports = AppError;
