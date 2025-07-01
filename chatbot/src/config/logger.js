const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Create logs directory if it doesn't exist
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Custom log levels that include 'trace'
const logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        debug: 3,
        trace: 4  // Added trace level
    },
    colors: {
        error: 'red',
        warn: 'yellow',
        info: 'green',
        debug: 'blue',
        trace: 'gray'
    }
};

const logger = winston.createLogger({
    levels: logLevels.levels,  // Use custom levels
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'error.log'),
            level: 'error'
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'combined.log'),
            level: 'info'  // Log info and above to combined file
        })
    ]
});

// Enable colors
winston.addColors(logLevels.colors);

if (process.env.NODE_ENV === 'development') {
    logger.add(new winston.transports.Console({
        level: 'trace',  // Show all levels including trace in development
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(info => {
                return `${info.timestamp} [${info.level}]: ${info.message} ${info.stack || ''}`;
            })
        )
    }));
}

module.exports = logger;