var Hapi = require('hapi');
var levelup = require('levelup');
var fs = require('fs');

var db = levelup('./mydb');

var server = new Hapi.Server();
server.connection({ port: 3000 });

fs.readdirSync('./controllers').forEach(function (file) {
    if(file.substr(-3) == '.js') {
        route = require('./controllers/' + file);
        route.controller(server, db);
    }
});

server.start(function () {
    console.log('Server running at:', server.info.uri);
});
