(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var Backbone = window.Backbone;

  var callbacks = {};
  var queue = [];

  // STATES
  // 0 - disconnected
  // 1 - connecting (optionally generating live key)
  // 2 - connected and awaiting authorization
  // 3 - connected and authorized

  var live = window.live = _.extend(Backbone.Events, {
    reconnectWait: 1000,

    authRequired: false,

    connect: function (url) {
      url = live.url = url || live.url || '';
      if (live.state) return;
      live.state = 1;
      return live.authRequired ? live.authorize() : live.createSocket();
    },

    createSocket: function () {
      var socket = live.socket = new WebSocket(live.url);
      socket.onopen = live.onopen;
      socket.onclose = live.onclose;
      socket.onmessage = live.onmessage;
      return live;
    },

    authorize: function () {
      live.state = 1;
      $.ajax({
        url: live.url,
        success: function (liveKey) {
          live.createSocket().send('authorize', liveKey, function (er) {
            if (er) throw new Error(er);
            live.state = 3;
            live.flushQueue();
          });
        },
        error: live.onclose
      });
      return live;
    },

    send: function (name, data, cb) {
      if (!name) return live;
      if (!live.state) live.connect();
      if (live.state === 3 || (live.state === 2 && name === 'authorize')) {
        var id = _.uniqueId();
        var req = {id: id, name: name, data: data};
        callbacks[id] = cb;
        live.socket.send(JSON.stringify(req));
      } else {
        queue.push(arguments);
      }
      return live;
    },

    flushQueue: function () {
      var clone = queue.slice();
      queue = [];
      for (var args; args = clone.shift();) live.send.apply(live, args);
    },

    onopen: function () {
      live.state = live.authRequired ? 2 : 3;
      live.flushQueue();
    },

    onclose: function () {
      live.state = 0;
      clearTimeout(live.reconnectTimeout);
      live.reconnectTimeout = _.delay(live.connect, live.reconnectWait);
    },

    onmessage: function (ev) {
      var raw = ev.data;
      try { raw = JSON.parse(raw); } catch (er) { return; }
      var id = raw.id;
      if (!id) return;
      var cb = callbacks[id];
      delete callbacks[id];
      var name = raw.name;
      if (name) {
        return live.trigger(name, raw.data, function (er, data) {
          var socket = live.socket;
          if (socket.readyState !== 1) return;
          var res = {id: id};
          if (er) res.error = er.message || er;
          if (data) res.data = data;
          socket.send(JSON.stringify(res));
        });
      }
      if (cb) cb(raw.error, raw.data);
    }
  });
})();
