var Hapi = require('hapi');
var levelup = require('levelup');
var fs = require('fs');
var winston = require('winston');
var GoodWinston = require('good-winston');

var db = levelup('./mydb');

var secret = 'TestSecretNOTINPRODUCTION';

var server = new Hapi.Server();
server.connection({
  port: 3000
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
