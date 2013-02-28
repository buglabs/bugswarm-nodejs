/*jslint node: true */
'use strict';

function AppError(str) {
    this.str = str;

    Error.call(this);
    Error.captureStackTrace(this, AppError);
}

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