var _ = require('underscore');
var app = require('./express');
var config = require('../config');
var jsonpatch = require('fast-json-patch');
var redis = require('redis');
var movesCreate = require('../../interactions/moves/create');
var User = require('../../models/user');
var ws = require('ws');

var wss = app.wss = new ws.Server({server: app.server});
var OPEN = ws.OPEN;
var clients = wss.clients;

var wsMsg = function (name, obj) {
  return JSON.stringify({id: _.uniqueId(), name: name, data: obj});
};

var broadcast = function (name, data) {
  _.invoke(_.where(clients, {readyState: OPEN}), 'send', wsMsg(name, data));
};

app.game.get('users').on('message', function (message) {
  broadcast('message', message);
});

app.wss.on('connection', function (client) {
  client.state = {};
  client.on('message', function (data) {
    try { data = JSON.parse(data); } catch (e) { return; }
    if (data.name === 'authorize') {
      redis.client.get('liveKey:' + data.data, function (er, id) {
        if (er) return er;
        client.userId = id;
        client.send(JSON.stringify({id: data.id}));
      });
    } else if (data.name === 'game') {
      var observer = jsonpatch.observe(data.data);
      _.extend(data.data, app.game.toFrame());
      client.send(JSON.stringify({
        id: data.id,
        data: jsonpatch.generate(observer)
      }));
    } else if (client.userId) {
      var user = app.game.get('users').get(client.userId);
      if (user) {
        if (data.name === 'POST /moves') {
          return movesCreate.run({
            type: data.data.type,
            user: user,
            game: app.game
          }, function () {});
        }
      } else {
        (new User({id: client.userId})).fetch({cb: function (er, user, raw) {
          if (er || !raw) return;
          if (data.name === 'POST /moves') {
            movesCreate.run(
              {type: data.data.type, user: user, game: app.game},
              function () {}
            );
          }
        }});
      }
    }
  });
});
app.game.on('message', function (data) { broadcast(wsMsg('message', data)); });
var stateIntervalId = setInterval(function () {
  var state = app.game.toFrame();
  for (var i = 0, l = clients.length; i < l; ++i) {
    var client = clients[i];
    if (client.readyState !== OPEN) continue;
    var observer = jsonpatch.observe(client.state);
    _.extend(client.state, state);
    client.send(wsMsg('state', jsonpatch.generate(observer)));
  }
}, 1000 / config.mps);

process.on('SIGTERM', function () {
  clearInterval(stateIntervalId);
  wss.close();
});
