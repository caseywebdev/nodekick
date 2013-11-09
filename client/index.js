//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require backbone/backbone
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

    domReady: function () {
      $('html').addClass(config.mobile ? 'js-mobile' : 'js-desktop');
    },

    drawUsers: function (users) {
      console.log('drawing users...');
    },

    move: function (dir) {
      $.post('/move/' + dir);
      var $ack = $('.js-move-ack');
      $ack.removeClass('js-up js-left js-right').addClass('js-flash js-' + dir);
      $ack.height();
      $ack.removeClass('js-flash');
    }
  };

  if (!config.mobile) {
    app.socket = io.connect();
    app.socket.on('connect', app.socketReady);
  }

  (function () {
    var x0, y0, dx, dy;
    $(document).on({
      touchstart: function (ev) {
        ev = ev.originalEvent;
        if (ev.touches.length !== 1) return;
        var touch = ev.touches[0];
        x0 = touch.screenX;
        y0 = touch.screenY;
      },
      touchmove: function (ev) {
        ev.preventDefault();
        ev = ev.originalEvent;
        if (ev.touches.length !== 1 || dx !== null || dy !== null) return;
        var touch = ev.touches[0];
        dx = touch.screenX - x0;
        dy = touch.screenY - y0;
        var rightLeft = dx > 0 ? 'right' : 'left';
        var downUp = dy > 0 ? 'down' : 'up';
        var val = Math.abs(dx) > Math.abs(dy) ? rightLeft : downUp;
        app.move(val === 'down' ? rightLeft : val);
      },
      touchend: function (ev) {
        if (!ev.originalEvent.touches.length) dx = dy = null;
      },
      keydown: function (ev) {
        switch (ev.which) {
        case 37:
        case 65:
          app.move('left');
          break;
        case 38:
        case 87:
          app.move('up');
          break;
        case 39:
        case 68:
          app.move('right');
        }
      }
    });
  })();

  $(app.domReady);
})();
