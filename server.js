var Hapi = require('hapi');
var levelup = require('levelup');
var fs = require('fs');
var winston = require('winston');
var GoodWinston = require('good-winston');

var userDb = levelup('./userDb');
var thingsDb = levelup('./thingsDb');

var secret = 'TestSecretNOTINPRODUCTION';

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({json: false, colorize: true}),
      new (winston.transports.File)({ filename: 'server.log', json:false, colorize: true})
    ]
  });

var server = new Hapi.Server();
server.connection({
  address: server_ip_address,
  port: server_port
});

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
      }, logger)
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
    route.controller(server, userDb, thingsDb, secret, logger);
  }
});

server.start(function() {
  logger.debug('Server running at:', server.info.uri);
});
