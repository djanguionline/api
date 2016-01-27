'use strict';

// Log
var bunyan = require('bunyan');
var logger;

module.exports = function createLogger(configuration) {
    if (logger) {
        return logger;
    }

    if (!configuration) {
        throw new Error('Invalid configuration during creating logger');
    }

    var bunyan_configuration = {
        name: configuration.get('api:applicationName'),
        streams: [
            {
                level: configuration.get('log:level'),
                stream: eval(configuration.get('log:stream'))
            }
        ]
    };

    if (configuration.get('log:path')) {
        bunyan_configuration.streams.push({
            type: 'rotating-file',
            level: configuration.get('log:level'),
            path: configuration.get('log:path'),
            period: configuration.get('log:period'),   // daily rotation
            count: configuration.get('log:count')        // keep 3 back copies
        });
    }

    logger = bunyan.createLogger(bunyan_configuration);

    return logger;
};
