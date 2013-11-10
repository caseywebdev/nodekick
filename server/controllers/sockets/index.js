'use strict';

var _ = require('underscore');

module.exports = function (app) {
  var clients = app.wss.clients;

  var wsMsg = function (name, obj) {
    return JSON.stringify({id: _.uniqueId(), name: name, data: obj});
  };

  var broadcast = function (name, data) {
    _.invoke(clients, 'send', wsMsg(name, data));
  };

  // send all user data
  app.wss.on('connection', function (ws) {
    app.world.getScores(function (er, scores) {
      if (er) throw er;
      ws.send(wsMsg('scores', scores));
    });
  });

  app.world.users.on('message', function (message) {
    broadcast('message', message);
  });

  app.world.users.on('death', function (message) {
    broadcast('death', message);
  });

  app.world.users.on('add', function (user) {
    app.world.getScores(function (er, scores) {
      if (er) throw er;
      broadcast('scores', scores);
    });
  });
  app.world.on('scores', function (scores) {
    broadcast('scores', scores);
  });

  // send user frames
  app.world.on('step', function (users) {
    broadcast('step', users);
  });

  process.on('SIGTERM', _.partial(_.invoke, clients, 'close'));
};

