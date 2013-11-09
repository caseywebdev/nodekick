//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require config

(function () {
  'use strict';

  var config = window.config;
  var io = window.io;

  var app = window.app = {
    socket: io.connect(),

    socketReady: function () {

    }
  };

  if (!config.mobile) {
    app.socket = io.connect();
    app.socket.on('connect', app.socketReady);
  }
})();
