//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require backbone/backbone
//= require config
//= require request-animation-frame-polyfill
//= require player
//= require player-collection
//= require drawer
//= require assets

(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var config = window.config;
  var io = window.io;

  var app = window.app = {

    users: window.NodeKick.PlayerCollection,

    socketReady: function () {
      app.socket.on('step', app.updateUsers);
    },

    domReady: function () {
      $('html').addClass(config.mobile ? 'js-mobile' : 'js-desktop');
      NodeKick.Drawer.init();
      window.NodeKick.Assets.init();
    },

    draw: function() {

      if (!NodeKick.Drawer.canvas || !NodeKick.Assets.isLoaded) {
        console.log('assets not yet loaded');
        return; //DOM is not yet loaded or image assets have not loaded, so no need to draw yet!
      }

      NodeKick.Drawer.drawBackground();
      NodeKick.Drawer.drawUsers(this.users);
    },

    updateUsers: function (users) {
      _.each(users, function (user) {
        var obj = app.users[user.id];
        if (!obj) obj = app.users[user.id] = {};
        _.extend(obj, user);
      });
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

  function drawLoop() {
    console.log('draw loop');
    window.requestAnimationFrame(drawLoop);
    app.draw();
  }

  drawLoop();

  // /* ====== TEMP: REMOVE WHEN WE HAVE LIVE SOCKET PEOPLE ======== */

  // console.log('stuff', window.NodeKick, app)

  var player1 = new window.NodeKick.Player('bob');
  player1.x = 100;
  player1.y = 0;
  player1.state = 'stand';

  // console.log('the player', player1);

  var player2 = new window.NodeKick.Player('fred');
  player2.x = 500;
  player2.y = -300;
  player2.state = 'jump';

  // app.users[player1.handle] = player1;
  // app.users[player2.handle] = player2;

  setInterval(function() {
    player2.x += 10;
  }, 100);


  // /* ============================================================ */


})();
