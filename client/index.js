//= require bower_components/jquery/dist/jquery.js
//= require bower_components/underscore/underscore.js
//= require node_modules/underscore.string/dist/underscore.string.min.js
//= require bower_components/backbone/backbone.js
//= require bower_components/herit/herit.js
//= require node_modules/backbone-relations/backbone-relations.js
//= require bower_components/live/live.js
//= require bower_components/pixi/bin/pixi.js
//= require bower_components/soundmanager/script/soundmanager2.js
//= require node_modules/fast-json-patch/src/json-patch.js
//= requireSelf
//= require ./config.js
//= requireTree ./setup
//= requireTree ../models
//= requireTree ./templates
//= requireTree ./views

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
      if (!app.config.mobile) {
        app.live.connect()
          .on('state-patches', app.applyStatePatches)
          .on('message', _.bind(app.messages.add, app.messages));
      }
      $(app.domReady);
      app.loadSpriteSheets(app.spriteSheetsReady);
    },

    loadSpriteSheets: function (cb) {
      var loader = new PIXI.AssetLoader(this.spriteSheets);
      loader.onComplete = cb;
      loader.load();
    },

    applyStatePatches: function (statePatches) {
      if (!app.state) app.state = {};
      if (!statePatches.length) return;
      jsonpatch.apply(app.state, statePatches);
      app.game.set(_.omit(app.state, 'userIds'));
      var recentUsers = app.game.get('recentUsers');
      app.game.get('users').set(
        _.map(app.state.userIds, _.bind(recentUsers.get, recentUsers))
      );
    },

    domReady: function () {
      $('html').addClass(app.config.mobile ? 'js-mobile' : 'js-desktop');
      new app.MainView({el: 'body', messages: app.messages});
      app.setUpMoveAck();
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

    spriteSheetsReady: function () {
      if (app.config.mobile) return;
      $(function () { new app.GamesShowView({model: app.game, el: '#game'}); });
    },

    setUpMoveAck: function () {
      if (!app.currentUserId) return;
      var url = '/images/sprite-sheet.png';
      $('.js-move-ack').css('backgroundImage', "url('" + url + "')");
    },

    playSound: function (id) {
      var sound = app.sounds[id];
      if (sound) sound[++sound.track % app.config.soundTracks].play();
    }
  };

  _.defer(app.init);
})();
