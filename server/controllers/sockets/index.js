'use strict';

var _ = require('underscore');

module.exports = function (app) {
  var clients = app.wss.clients;
  app.world.on('step', function (users) {
    var message = JSON.stringify({
      id: _.uniqueId(),
      name: 'step',
      data: users
    });
    _.each(clients, function (client) { client.send(message); });
  });
  process.on('SIGTERM', _.partial(_.invoke, clients, 'close'));
};

