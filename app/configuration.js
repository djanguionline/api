'use strict';

// Configuration
var conf = require('nconf');

conf.env('_');

// Loads all values defined in file configuration_default.json
conf.file({file: 'configuration_default.json'});

// Loads any file defined via environment variable named API_CONFIG_PATH
if (conf.get('API_CONFIG_PATH')) {
    conf.file({file: conf.get('API_CONFIG_PATH')});
}


module.exports = conf;
