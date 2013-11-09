'use strict';

var sockets = {};
var _ = require('underscore');

module.exports = function (app) {
  app.io.sockets.on('connection', function (socket) {
    sockets[socket.id] = socket.volatile;
    console.log(socket.handshake);

    socket.on('disconnect', function () {
      delete sockets[socket.id];
    });
  });

  app.world.on('step', function (users) {
    _.invoke(sockets, 'emit', 'step', users);
  });
};

process.on('SIGTERM', _.partial(_.invoke, sockets, 'disconnect'));
