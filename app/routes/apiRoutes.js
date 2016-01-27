'use strict';
var Joi = require('joi'),
     package_json = require('../../package.json');


function ApiRoutes(server) {
    if (!(this instanceof ApiRoutes)) {
        return new ApiRoutes(server);
    }
    ApiRoutes.prototype.server = server;
}

ApiRoutes.prototype.loadAPIRoutes = function (apiVersion) {
    this.server.route([
        {
            // Access to the API Documentation
            method: 'GET',
            path: apiVersion + '/doc/{param*}',
            handler: {
                directory: {
                    path: __dirname + '/../../public'
                }
            }
        },
        {
            method: 'GET',
            path: apiVersion + '/version',
            handler: function (req, reply) {
                reply(package_json.version);
            }
        }
    ]);
};

module.exports = ApiRoutes;
