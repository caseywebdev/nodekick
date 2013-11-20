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
//= requireTree templates
//= requireTree views

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
      app.live.connect()
        .on('state', app.updateState)
        .on('message', _.bind(app.messages.add, app.messages));
      $(app.domReady);
      app.loadSpriteSheets(function () {
        if (app.config.mobile) return;
        $(function () {
          new app.GamesShowView({model: app.game, el: '#game'});
        });
      });
    },

    loadSpriteSheets: function (cb) {
      var loader = new PIXI.AssetLoader(this.spriteSheets);
      loader.onComplete = cb;
      loader.load();
    },

    updateState: function (state) {
      if (!app.state) app.state = {};
      jsonpatch.apply(app.state, state);
      app.game.set(app.state);
    },

    domReady: function () {
      $('html').addClass(app.config.mobile ? 'js-mobile' : 'js-desktop');
      new app.MainView({el: 'body', messages: app.messages});
      app.setUpMoveAck();
    },

    setUpMoveAck: function () {
      if (!app.currentUserId) return;
      var url = '/images/sprite-sheet.png';
      $('.js-move-ack').css('backgroundImage', "url('" + url + "')");
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
