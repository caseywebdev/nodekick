//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require config

(function () {
  'use strict';

  var $ = window.jQuery;
  var config = window.config;
  var io = window.io;

  var app = window.app = {
    socketReady: function () {
      app.socket.on('step', app.drawUsers);
    },

    domReady: function () {},

    drawUsers: function (users) {
      console.log('drawing users...');
    }
  };

  if (!config.mobile) {
    app.socket = io.connect();
    app.socket.on('connect', app.socketReady);
  }

  $(app.domReady);
})();
