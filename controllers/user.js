//user controller

var crypto = require('crypto');
var shasum = crypto.createHash('sha1');

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

  function saveUser(request, reply) {
    if(request.payload) {
      shasum.update(request.payload);
      var id = shasum.digest('base64');
      db.get(id, function(err, user) {
        if(user) {
          reply({
            status: 'FAILED',
            description: 'User exists'
          });
        }
      });
      db.put(id, request.payload, function(err) {
        if(err) {
          console.log(err);
          reply({
            status: 'FAILED',
            description: 'Failed to save user'
          });
        }
        return;
      });
      reply({
        status: 'OK',
        description: 'Saved user',
        userId: id
      });
    } else {
      reply({
        status: 'FAILED',
        description: 'Empty request'
      });
    }
  }

  function getUser(request, reply) {
    if(request.params.id) {
      db.get(request.params.id, function(err, user) {
        if(err) {
          reply({
            status: 'FAILED',
            description: 'No user found'
          });
        }
        if(user) {
          reply(user);
        }
        return;
      });
    } else {
      reply({
        status: 'FAILED',
        description: 'Empty request'
      });
    }
  }
};
