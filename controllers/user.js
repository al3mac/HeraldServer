//user controller
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

module.exports.controller = function(server, db, secret) {
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
    path: '/api/user/login/{id}',
    handler: loginUser
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
    db.put(id, JSON.stringify(request.payload), function(err) {
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
        return reply(JSON.parse(user));
      }
    });
  }

  function fail(reply, description) {
    return reply({
      status: 'Failed',
      description: description
    }).code(501);
  }

  //Accepts {username: username, pass: hashOfUserPass}
  function loginUser(request, reply) {
    if(request.payload && request.payload.username && request.payload.pass) {
        db.get(request.params.id, function(err, user) {
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
