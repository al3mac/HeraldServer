//user controller

var crypto = require('crypto');
var shasum = crypto.createHash('sha1');
var q = require('q');

module.exports.controller = function(server, db) {
  server.route({
    method: 'PUT',
    path: '/api/user/',
    handler: saveUser
  });

  server.route({
    method: 'GET',
    path: '/api/user/{id}',
    handler: getUser
  });
};
