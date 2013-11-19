//= require jquery/jquery
//= require underscore/underscore
//= require underscore.string/dist/underscore.string.min
//= require backbone/backbone
//= require herit/herit
//= require backbone-relations/backbone-relations
//= require live/live
//= require pixi/bin/pixi
//= require soundmanager/script/soundmanager2
//= require fast-json-patch/src/json-patch.js
//= requireSelf
//= require config
//= requireTree setup
//= requireTree ../models
//= requireTree views
//= requireTree templates

(function () {
  'use strict';

  var $ = window.jQuery;
  var _ = window._;
  var jsonpatch = window.jsonpatch;
  var Live = window.Live;
  var PIXI = window.PIXI;
  var soundManager = window.soundManager;

  var app = window.app = {
    csrfToken: $('meta[name="csrf-token"]').attr('content'),

    currentUserId: $('meta[name="current-user-id"]').attr('content'),

    spriteSheets: ['/images/sprite-sheet.json'],

    live: new Live({
      fetchAuthKey: function (cb) {
        $.ajax({url: '/auth/live', success: _.partial(cb, null), error: cb});
      }
    }),

    init: function () {
      app.game = new app.Game();
      app.messages = new app.Message.Collection();
      $(app.domReady);
      app.loadSpriteSheets(function () {
        $(function () {
          new app.MainView({el: 'body', messages: app.messages});
          new app.GamesShowView({model: app.game, el: '#game'});
        });
        if (!app.config.mobile) {
          app.live.connect()
            .on('message', _.bind(app.messages.add, app.messages));
          app.requestState =
            _.throttle(app.requestState, 1000 / app.config.mps);
          app.requestState();
        }
      });
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

    requestState: function () {
      if (!app.serverState) app.serverState = {};
      app.live.send('game', app.serverState, function (er, patches) {
        jsonpatch.apply(app.serverState, patches);
        app.game.set(app.serverState);
        app.requestState();
      });
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

    soundManagerReady: function () {
      app.sounds = _.reduce(app.config.sounds, function (sounds, id) {
        var sound = sounds[id] = {track: 0};
        _.times(app.config.soundTracks, function (track) {
          sound[track] = soundManager.createSound(
            id + '-' + track,
            '/audio/' + id + '.mp3'
          );
        });
        return sounds;
      }, {});
    },

    playSound: function (id) {
      var sound = app.sounds[id];
      if (sound) sound[++sound.track % app.config.soundTracks].play();
    }
  };

  _.defer(app.init);
})();
