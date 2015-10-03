//Info controller
module.exports.controller = function(server, db, logger) {
  server.route({
    method: 'GET',
    path: '/api/',
    handler: getInfo
  });

  function getInfo(request, reply) {
    reply({
      version: 'v1',
      environment: 'local',
      port: '3000'
    });
  }
};
