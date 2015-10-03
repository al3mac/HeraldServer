//things you own controller
var shortid = require('shortid');
module.exports.controller = function(server, userDb, thingsDb, secret, logger) {

  var validate = function(request, decodedToken, callback) {
    userDb.get(decodedToken.username, function(err, user) {
        if(err) {
          return callback(err, false, {});
        } else {
          return callback(err, true, JSON.parse(user));
        }
    });
  };

  server.register(require('hapi-auth-jwt'), function(error) {
    server.auth.strategy('token', 'jwt', {
      key: secret,
      validateFunc: validate
    });

    server.route({
      method: 'PUT',
      path: '/api/things/',
      handler: addThing,
      config: {
        auth: 'token'
      }
    });

    server.route({
      method: 'GET',
      path: '/api/things/{id}',
      handler: getThing,
      config: {
        auth: 'token'
      }
    });

    server.route({
      method: 'GET',
      path: '/api/things/all',
      handler: getAllThings,
      config: {
        auth: 'token'
      }
    });

    server.route({
      method: 'DELETE',
      path: '/api/things/{id}',
      handler: deleteThing,
      config: {
        auth: 'token'
      }
    });

    function addThing(request, reply) {
      if (request.payload) {
        request.payload.id = shortid.generate();
        thingsDb.get(request.payload.id, function(err, thing) {
          if (thing) {
            return failed(reply, 'I already have an id like this');
          } else {
            saveThing(request, reply);
          }
        });
      } else {
        logger.debug("Empty request");
        return failed(reply, 'Empty request');
      }
    }

    function saveThing(request, reply) {
      thingsDb.put(request.payload.id, JSON.stringify(request.payload), function(err) {
        if (err) {
          return failed(reply, 'Failed to save item');
        } else {
          var user = request.auth.credentials;
          addThingToArray(user, request);
          saveUser(user, reply, request);
        }
      });
    }

    function addThingToArray(user, request) {
      if(user.things) {
        user.things.push(request.payload.id);
      } else {
        user.things = [request.payload.id];
      }
    }

    function saveUser(user, reply, request) {
      userDb.put(user.username, JSON.stringify(user), function(err) {
        if(err) {
          return fail(reply, 'Error while saving user data');
        } else {
          return reply({
            id: request.payload.id
          });
        }
      });
    }

    function getThing(request, reply) {
      if(request.params.id) {
        thingsDb.get(request.params.id, function(err, thing) {
          if(err) {
            return fail(reply, 'No thing with that id found');
          } else {
            return reply(JSON.parse(thing));
          }
        });
      } else {
        return fail(reply, 'Empty request');
      }
    }

    function getAllThings(request, reply) {
      var result = [];
      var user = request.auth.credentials;
      if(user) {
          return reply({
            things: user.things
          });
      } else {
        return fail(reply, 'No user found for token');
      }
    }

    function deleteThing(request, reply) {
      var thingId = request.params.id;
      if(thingId) {
        var user = request.auth.credentials;
        var index = user.things.indexOf(thingId);
        if(index > -1) {
          user.things.splice(index, 1);
          deleteFromUserDb(user, reply, thingId);
        } else {
          return fail(reply, 'No such thing');
        }
      } else {
        return fail(reply, 'Empty request');
      }
    }

    function deleteFromUserDb(user, reply, thingId) {
      userDb.put(user.username, JSON.stringify(user), function(err) {
        if(err) {
          return fail(reply, 'Error while saving user data');
        } else {
          deleteFromThingsDb(reply, thingId);
        }
      });
    }

    function deleteFromThingsDb(reply, thingId) {
      thingsDb.del(thingId, function(err) {
        if(err) {
          return fail(reply, 'Error while deleting thing');
        } else {
          return reply({id: thingId});
        }
      });
    }

    function fail(reply, description) {
      return reply({
        status: 'Failed',
        description: description
      }).code(404);
    }
  });
};
