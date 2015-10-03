var gcm = require('node-gcm');
module.exports.controller = function(server, userDb, thingsDb, secret, logger) {
  var sender = gcm.Sender('759198214800');

  server.route({
    method: 'POST',
    path: '/api/messages',
    handler: sendMessage,
    config: {
      auth: 'token'
    }
  });

  function sendMessage(request, reply) {
    if (request.payload && request.payload.id && request.payload.message) {
      var id = request.payload.id;
      var message = request.payload.message;
      thingsDb.get(id, function(err, thing) {
        if (err) {
          return fail(reply, 'No thing with that id found');
        } else {
          var username = thing.username;
          userDb.get(username, function(err, user) {
            if (err) {
              return fail(reply, 'Found no user connected to thing');
            } else {
              var token = user.token;
              sendSampleMessage(token, reply);
            }
          });
        }
      });
    } else {
      return fail(reply, 'Empty request');
    }
  }

  function sendSampleMessage(token, reply) {
    var message = new gcm.Message();
    var regIds = [token];
    message.addData('key1', 'msg1');
    sender.send(message, {
      registrationIds: regIds
    }, function(err, result) {
      if (err) return fail(reply, 'Couldnt send message');
      else return reply({
        send: "true"
      });
    });
  }

  function fail(reply, description) {
    return reply({
      status: 'Failed',
      description: description
    }).code(404);
  }
};
