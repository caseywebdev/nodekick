//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require backbone/backbone
//= require live
//= require config
//= require request-animation-frame-polyfill
//= require player
//= require drawer
//= require assets

(function () {
  'use strict';

  var $ = window.jQuery;
  var config = window.config;
  var live = window.live;
  var _ = window._;
  var NodeKick = window.NodeKick;

  var app = window.app = {
    users: [],
    usersById: {},

    updateScoreboard: function (scores) {
      // var $scoreboard = $('#scoreboard');
      console.log('scoreboard: ', scores);
    },

    domReady: function () {
      $('html').addClass(config.mobile ? 'js-mobile' : 'js-desktop');
      NodeKick.Drawer.init();
      window.NodeKick.Assets.init();
    },

    draw: function () {

      if (!NodeKick.Drawer.canvas || !NodeKick.Assets.isLoaded) {
        console.log('assets not yet loaded');
        // DOM is not yet loaded or image assets have not loaded,
        // so no need to draw yet!
        return;
      }

      NodeKick.Drawer.drawBackground();
      NodeKick.Drawer.drawUsers(this.users);
    },

    updateUsers: function (users) { app.users = users; },

    updateUserData: function (users) {
      _.reduce(users, function (usersById, user) {
        usersById[user.id] = user;
        return usersById;
      }, app.usersById);

    },

    move: function (dir) {
      $.post('/move/' + dir);
      var $ack = $('.js-move-ack');
      $ack.removeClass('js-transition js-up js-left js-right')
        .addClass('js-flash js-' + dir)
        .height();
      $ack.addClass('js-transition').removeClass('js-flash');
    }
  };

  if (!config.mobile) {
    live.connect('ws://' + location.host)
      .on('step', app.updateUsers)
      .on('userData', app.updateUserData)
      .on('scores', app.updateScoreboard);
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

  function drawLoop() {
    window.requestAnimationFrame(drawLoop);
    app.draw();
  }

  drawLoop();
})();
