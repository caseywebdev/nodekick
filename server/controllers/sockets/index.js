'use strict';

var _ = require('underscore');
var ws = require('ws');
var config = require('../../config');

var OPEN = ws.OPEN;

module.exports = function (app) {
  var clients = app.wss.clients;

  var wsMsg = function (name, obj) {
    return JSON.stringify({id: _.uniqueId(), name: name, data: obj});
  };

  var broadcast = function (name, data) {
    _.invoke(_.where(clients, {readyState: OPEN}), 'send', wsMsg(name, data));
  };

  // send all user data

  app.game.get('users').on('message', function (message) {
    broadcast('message', message);
  });

  var sendGame = _.debounce(function () { broadcast('game', app.game); });
  app.wss.on('connection', sendGame);
  setInterval(sendGame, config.mps);
  app.game.get('users').on('add remove change:state change:dir', sendGame);
  app.game.get('recentUsers').on('remove', sendGame);

  process.on('SIGTERM', _.partial(_.invoke, clients, 'close'));
};
