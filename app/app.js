'use strict';

var Hapi = require('hapi');
var Inert = require('inert');
var Vision = require('vision');
var HapiSwagger = require('hapi-swagger');

var server = new Hapi.Server({debug: {request: []}});
var package_json = require('../package.json');

server.init = function (configuration) {

    // Logging
    server.logger = require('./logger.js')(configuration);

    server.connection({
        host: configuration.get('api:listeningAddress'),
        port: configuration.get('api:port'),
        routes: {
            cors: true
        },
        labels: ['api']
    });

    server.on('response', function (request) {
        var c = {};
        c.url = request.path;
        c.method = request.method;
        c.statusCode = request.response.statusCode;
        c.id = request.id;
        c.responseTimeMs = (request.info.responded - request.info.received);
        c.origin = request.headers['x-real-ip'];
        c.language = request.headers['accept-language'];
        server.logger.info(c);
    });

    process.env.NODE_TLS_REJECT_UNAUTHORIZED = configuration.get('api:NodeTlsRejectUnauthorized');

    server.logger.info('Server configured on ' + server.info.uri);

    // Replace Boom error with OAuth2 wanted structure, in snake_case. See https://tools.ietf.org/html/rfc6749#page-45
    server.ext('onPreResponse', function (request, reply) {
        if (request.response.isBoom) {
            request.response.output.payload.status_code = request.response.output.statusCode;
            request.response.output.payload.error = request.response.output.payload.error.toLowerCase().replace(/ /g, '_');
            request.response.output.payload.error_description = (request.response.output.payload.error_description ? request.response.output.payload.error_description : request.response.output.payload.message);
            delete request.response.output.payload.statusCode;
            delete request.response.output.payload.message;
        }
        return reply.continue();
    });

    return '/v' + configuration.get('api:apiVersion');
};

server.initSwagger = function (configuration, apiRootUrl) {
    var swaggerOptions = {
        basePath: configuration.get('swagger:basePath'),
        protocol: configuration.get('swagger:protocol'),
        apiVersion: configuration.get('api:apiVersion') + '',
        endpoint: apiRootUrl + '/docs'
    };

    server.register([
        Inert,
        Vision,
        {
            register: HapiSwagger,
            options: swaggerOptions
        }], function (err) {
        if (err) {
            server.logger.error(['error'], 'hapi-swagger load error: ' + err)
        } else {
            server.logger.info(['start'], 'hapi-swagger interface loaded')
        }
    });
};

server.initBunyan = function () {
    server.register({
        register: require('hapi-bunyan'),
        options: {
            logger: server.logger
        }
    }, function (err) {
        if (err) {
            server.logger.error(['error'], 'hapi-bunyan load error: ' + err)
        } else {
            server.logger.info(['start'], 'hapi-bunyan loaded')
        }
    });
};

server.loadRoutes = function (apiRootUrl) {

    //API routes
    var ApiRoutes = require('./routes/apiRoutes');
    var apiRoutes = new ApiRoutes(server);
    apiRoutes.loadAPIRoutes(apiRootUrl);
};

module.exports = server;
