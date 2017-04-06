"use strict";
var winston_1 = require("winston");
var logger = new winston_1.default.logger({
    transports: [
        new winston_1.default.transports.File({
            name: 'common',
            level: 'info',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880,
            maxFiles: 5,
            colorize: false
        }),
        new winston_1.default.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});
module.exports = logger;
