'use strict';

var server = require('./app/app.js');
var conf = require('./app/configuration.js');

var apiRootUrl = server.init(conf);
server.initSwagger(conf, apiRootUrl);
server.initBunyan();
server.loadRoutes(apiRootUrl);

server.start(function() {
    console.log('Server started.');
});