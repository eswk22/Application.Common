import winston from 'winston';

var logger = new winston.logger({
    transports : [
        new winston.transports.File({
            name : 'common',  
            level: 'info',
            filename: './logs/all-logs.log', 
            handleExceptions: true,
            json: true,  
            maxsize: 5242880, //5MB 
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true 
        })
    ],
    exitOnError: false
});

export = logger;