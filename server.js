var Hapi = require('hapi');
var levelup = require('levelup');
var fs = require('fs');
var winston = require('winston');
var GoodWinston = require('good-winston');

var db = levelup('./mydb');

var secret = 'TestSecretNOTINPRODUCTION';

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var server = new Hapi.Server();
server.connection({
  address: server_ip_address,
  port: server_port
});

server.register({
  register: require('good'),
  options: {
    reporters: [
      new GoodWinston({
        ops: '*',
        request: '*',
        response: '*',
        log: '*',
        error: '*'
      }, winston)
    ]
  }
}, function(err) {
  if (err) {
    return server.log(['error'], 'good load error: ' + err);
  }
});

fs.readdirSync('./controllers').forEach(function(file) {
  if (file.substr(-3) == '.js') {
    route = require('./controllers/' + file);
    route.controller(server, db, secret);
  }
});

server.start(function() {
  console.log('Server running at:', server.info.uri);
});
