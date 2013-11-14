//= require jquery/jquery
//= require underscore/underscore
//= require underscore.string/dist/underscore.string.min
//= require backbone/backbone
//= require herit/herit
//= require backbone-relations/backbone-relations
//= require live/live
//= require pixi/bin/pixi
//= require soundmanager/script/soundmanager2
//= requireSelf
//= require config
//= requireTree ../models
//= requireTree views
//= requireTree templates
//= require scoreboard
//= require sounds

(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var Live = window.Live;
  var PIXI = window.PIXI;

  $.ajaxSetup({
    dataType: 'json',

    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-CSRF-Token', app.csrfToken);
    }
  });

  var app = window.app = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),

    currentUserId: $('meta[name="current-user-id"]').attr('content'),

    spriteSheets: ['/images/sprite-sheet.json'],

    live: new Live({
      // fetchAuthKey: function (cb) {
      //   $.ajax({url: '/auth/live', success: _.partial(cb, null), error: cb});
      // }
    }),

    init: function () {
      app.world = new app.World();
      $(app.domReady);
      app.loadSpriteSheets(function () {
        $(function () {
          new app.MainView({el: 'body'});
          new app.WorldsShowView({model: app.world, el: '#world'});
        });
      });
      if (!app.config.mobile) {
        app.live.connect()
          .on('world', function (world) {
            app.world.set(world);
            app.world.start();
          })
          .on('message', app.onMessage);
      }
    },

    loadSpriteSheets: function (cb) {
      var loader = new PIXI.AssetLoader(this.spriteSheets);
      loader.onComplete = cb;
      loader.load();
    },

    characterTextures: {
      'donatello': {},
      'kick': {},
      'redacted': {}
    },

    domReady: function () {
      $('html').addClass(app.config.mobile ? 'js-mobile' : 'js-desktop');
      // new app.ScoresListView({collection: app.scores});
      app.setUpMoveAck();
    },

    setUpMoveAck: function () {
      if (!app.currentUserId) return;
      var url = '/images/sprite-sheet.png';
      $('.js-move-ack').css('backgroundImage', "url('" + url + "')");
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
      }, 3000);
    }
  };

  _.defer(app.init);
})();
