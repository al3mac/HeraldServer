//user controller
var crypto = require('crypto');

module.exports.controller = function(server, db, logger) {
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
      var shasum = crypto.createHash('sha1');
      shasum.update(JSON.stringify(request.payload));
      var id = shasum.digest('hex');
      db.get(id, function(err, existingUser) {
        if(existingUser) {
          console.log("User with this id already exists "+id);
          return fail(reply, 'User with this id already exists');
        } else {
          saveUserToDB(request, reply, id);
        }
      });
    } else {
      console.log("Empty request");
      return fail(reply, 'Empty request');
    }
  }

  function saveUserToDB(request, reply, id) {
    db.put(id, request.payload, function(err) {
      if(err) {
        console.log("Error while saving user", err);
        return fail(reply, 'Error while saving user');
      } else {
        return reply({
          id: id
        });
      }
    });
  }

  function getUser(request, reply) {
    db.get(request.params.id, function(err, user) {
      if(err) {
        console.log("Error while searching for user");
        return fail(reply, 'Error while searching for user');
      } else {
        return reply(user);
      }
    });
  }

  function fail(reply, description) {
    return reply({
      status: 'Failed',
      description: description
    }).code(501);
  }
};
