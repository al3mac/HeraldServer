//user controller
var jwt = require('jsonwebtoken');

module.exports.controller = function(server, userDb, thingsDb, secret, logger) {
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

  server.route({
    method: 'POST',
    path: '/api/user/login',
    handler: loginUser
  });


  //username must be present in payload
  function saveUser(request, reply) {
    if(request.payload && request.payload.username) {
      var id = request.payload.username;
      userDb.get(id, function(err, existingUser) {
        if(existingUser) {
          logger.debug("User with this id already exists "+id);
          return fail(reply, 'User with this id already exists');
        } else {
          saveUserTouserDb(request, reply, id);
        }
      });
    } else {
      logger.debug("Empty request");
      return fail(reply, 'Empty request or required fields missing');
    }
  }

  function saveUserTouserDb(request, reply, id) {
    userDb.put(id, JSON.stringify(request.payload), function(err) {
      if(err) {
        logger.debug("Error while saving user", err);
        return fail(reply, 'Error while saving user');
      } else {
        return reply({
          username: id
        });
      }
    });
  }

  function getUser(request, reply) {
    userDb.get(request.params.id, function(err, user) {
      if(err) {
        logger.debug("Error while searching for user");
        return fail(reply, 'Error while searching for user');
      } else {
        return reply(JSON.parse(user));
      }
    });
  }

  function fail(reply, description) {
    return reply({
      status: 'Failed',
      description: description
    }).code(404);
  }

  //Accepts {username: username, pass: hashOfUserPass}
  function loginUser(request, reply) {
    if(request.payload && request.payload.username && request.payload.pass) {
        userDb.get(request.payload.username, function(err, user) {
          if(err) {
            return fail(reply, 'No user found');
          } else {
            checkIfPassMatches(request, reply, JSON.parse(user));
          }
        });
    } else {
      return fail(reply, 'Empty login request');
    }
  }

  function checkIfPassMatches(request, reply, user) {
    if(user.pass === request.payload.pass) {
      var token = jwt.sign(user, secret);
      return reply({
        token: token
      });
    } else {
      return fail(reply, 'Wrong username/password');
    }
  }
};
