var gcm = require('node-gcm');
module.exports.controller = function(server, userDb, thingsDb, secret, logger) {
  var sender = gcm.Sender('AIzaSyDN7nitwMpn5uaRz_DXzH5LhvC7mvJrFhE');

  server.route({
    method: 'POST',
    path: '/api/messages',
    handler: sendMessage,
    config: {
      auth: 'token'
    }
  });

  server.route({
    method: 'GET',
    path: '/api/messages/test/{id}',
    handler: sendTestMessage
  });

  function sendMessage(request, reply) {
    if (request.payload && request.payload.id && request.payload.message) {
      var id = request.payload.id;
      var message = request.payload.message;
      thingsDb.get(id, function(err, thing) {
        if (err) {
          return fail(reply, 'No thing with that id found');
        } else {
          var username = JSON.parse(thing).username;
          userDb.get(username, function(err, user) {
            if (err) {
              return fail(reply, 'Found no user connected to thing');
            } else {
              var token = JSON.parse(user).token;
              sendSampleMessage(token, reply, message);
            }
          });
        }
      });
    } else {
      return fail(reply, 'Empty request');
    }
  }

  function sendSampleMessage(token, reply, messageToSend) {
    var message = new gcm.Message();
    var regIds = [token];
    message.addData('data', messageToSend);
    sender.send(message, { registrationIds: regIds }, function(err, result) {
      if (err) {
        return fail(reply, 'Couldnt send message');
      } else {
        return reply({
          send: "true"
        });
      }
    });
  }

  function sendTestMessage(request, reply) {
    userDb.get(request.params.id, function(err, user) {
      sendSampleMessage(JSON.parse(user).token, reply);
    });
  }

  function fail(reply, description) {
    return reply({
      status: 'Failed',
      description: description
    }).code(404);
  }
};
