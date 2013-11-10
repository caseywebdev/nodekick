//= require jquery/jquery
//= require jquery-mobile-events/jquery-mobile-events
//= require underscore/underscore
//= require backbone/backbone
//= require request-animation-frame-polyfill
//= require soundmanager/script/soundmanager2
//= require live
//= require config
//= requireSelf
//= requireTree ../models
//= requireTree ../views/jst
//= require scoreboard
//= require drawer
//= require assets
//= require sounds


(function () {
  'use strict';

  var $ = window.jQuery;
  var config = window.config;
  var live = window.live;
  var _ = window._;
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
      new app.ScoresListView({collection: app.scores});
      app.Drawer.init();
      app.Assets.init();
      app.setUpMoveAck();
    },

    setUpMoveAck: function () {
      if (!app.currentUserId) return;
      var available = app.Assets.availableSprites;
      var name = available[app.currentUserId % available.length];
      var url = '/images/' + name + '-sprite.png';
      $('.js-move-ack').css('backgroundImage', "url('" + url + "')");
    },

    draw: function () {
      if (!app.Drawer.canvas || !app.Assets.isLoaded()) return;
      app.Drawer.drawBackground();
      app.Drawer.drawUsers(app.world.users, app.currentUserId);
    },

    messageQueue: [],
    messageRate: 800,
    onMessage: function (message) {
      if (app.currentMessage) {
        app.messageQueue.push(message);
      } else {
        app.currentMessage = message;
        app.showMessage(message);
        clearInterval(app.messageInterval);
        app.messageInterval = setInterval(function () {
          var msg = app.currentMessage = app.messageQueue.shift();
          if (!msg) return clearInterval(app.messageInterval);
          app.showMessage(msg);
        }, app.messageRate);
      }
    },

    onDeath: function (message) {
      //play death sound?
    },

    playSound: function(sound) {
      if(window.NodeKick.Sounds) window.NodeKick.Sounds[sound].play();
    },

    showMessage: function (message) {
      var $alert = $('<li>');
      $alert.addClass('alert');
      $alert.addClass(message.type);
      var text = message.text;
      switch (message.type) {
      case 'streak':
        var streak = message.user.streak;
        if (streak == 3) {
          this.playSound("killingstreak");
          text = 'killing streak';
        } else if (streak == 6) {
          this.playSound("rampage");
          text = 'rampage!';
        } else if (streak == 9) {
          this.playSound("dominating");
          text = 'dominating!!';
        } else if (streak == 12) {
          this.playSound("unstoppable");
          text = 'unstoppable!!!';
        } else if (streak >= 15) {
          this.playSound("godlike");
          text = 'godlike!!!!';
        } else return;
        break;
      case 'headshot':
        this.playSound('headshot');
        break;
      case 'deathfromabove':
          this.playSound("deathfromabove");
        break;
      case 'multikill':
        var multis = message.user.multis;
        if (multis == 2) {
          this.playSound("doublekill");
          text = 'double kill!';
        } else if (multis == 3) {
          this.playSound("triplekill");
          text = 'triple kill!!';
        } else if (multis >= 4) {
          this.playSound("monsterkill");
          text = 'monster kill!!!';
        }
        break;
      }
      $alert.text(text);
      if (message.user) {
        $alert.prepend($('<img>').attr({src: message.user.avatar}));
      }
      $('.alerts').append($alert);
      setTimeout(function () {
        $alert.remove();
      }, 4000);
    },

    updateWorld: function (world) {
      app.world.timeScalar = world.timeScalar;
      app.world.users.set(world.users);
    },
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
    if (typeof WebSocket === 'undefined') return alert('Game requires websockets');
    live.connect('ws://' + location.host)
      .on('step', app.updateWorld)
      .on('message', app.onMessage)
      .on('death', app.onDeath)
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

  _.defer(drawLoop);
})();
