'use strict';

var _ = require('underscore');
var db = require('../../db');

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
    ws.send(wsMsg('userData', app.world.users.invoke('toUserData')));
    db.getScores(function (er, scores) {
      if (er) return er;
      ws.send(wsMsg('scores', scores));
    });
  });
  app.world.users.on('add', function (user) {
    broadcast('userData', [user.toUserData()]);
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

