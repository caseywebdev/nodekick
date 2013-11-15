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

  app.world.get('users').on('message', function (message) {
    broadcast('message', message);
  });

  var sendWorld = _.debounce(function () { broadcast('world', app.world); });
  app.wss.on('connection', sendWorld);
  setInterval(sendWorld, config.mps);
  app.world.get('users').on('add remove change:state change:dir', sendWorld);
  app.world.get('recentUsers').on('remove', sendWorld);

  process.on('SIGTERM', _.partial(_.invoke, clients, 'close'));
};
