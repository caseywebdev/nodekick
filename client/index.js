//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require backbone/backbone
//= requireTree ../views/jst
//= require scoreboard
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
  var Backbone = window.Backbone;

  // setInterval(function () {
  //   app.showMessage({
  //     type: 'killstreak',
  //     text: 'headshot'
  //   });
  // }, 3000);

  var app = window.app = {
    users: [],
    usersById: {},
    scores: new Backbone.Collection(null, {
      comparator: function (user) { return -~~user.get('score'); }
    }),

    domReady: function () {
      $('html').addClass(config.mobile ? 'js-mobile' : 'js-desktop');
      new window.ScoresListView({collection: app.scores});
      NodeKick.Drawer.init();
      window.NodeKick.Assets.init();
    },

    draw: function () {

      if (!NodeKick.Drawer.canvas || !NodeKick.Assets.isLoaded()) {
        console.log('assets not yet loaded');
        // DOM is not yet loaded or image assets have not loaded,
        // so no need to draw yet!
        return;
      }

      NodeKick.Drawer.drawBackground();
      NodeKick.Drawer.drawUsers(this.users);
    },

    showMessage: function (message) {
      var $alert = $('<li>');
      $alert.addClass('alert');
      $alert.addClass(message.type);
      $alert.text(message.text);
      $('.alerts').append($alert);
      setTimeout(function () {
        $alert.remove();
      }, 4000);
      console.log(message);
    },

    updateUsers: function (users) { app.users = users; },
    updateScoreboard: function (scores) {
      _.reduce(scores, function (usersById, user) {
        usersById[user.id] = user;
        return usersById;
      }, app.usersById);
      app.scores.set(scores);
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
      .on('message', app.showMessage)
      .on('scores', app.updateScoreboard);
  }

  (function () {
    var x0, y0, dx, dy;
    var pressed = {};
    var keys = {
      '38': 'up',
      '87': 'up',
      '37': 'left',
      '65': 'left',
      '39': 'right',
      '68': 'right'
    };
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
        var dir = keys[ev.which];
        if (!dir) return;
        if (!pressed[dir]) app.move(dir);
        pressed[dir] = true;
      },
      keyup: function (ev) {
        var dir = keys[ev.which];
        if (dir) pressed[dir] = false;
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
