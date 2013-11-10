//= require ./user

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var config = node ? require('../server/config') : window.config;
  var Backbone = node ? require('backbone') : window.Backbone;
  var User = node ? require('./user') : app.User;
  var db = node ? require('../server/db') : null;

  var World = Backbone.Model.extend({
    timeScalar: 1,
    initialize: function () {
      this.users = new User.Collection();
      var world = this;
      this.users.on('kill', function (kill) {
        world.bulletTime();
        if (!node) return;
        db.registerKill(kill.killer);
        world.getScores(function (er, scores) {
          world.trigger('scores', scores);
        });
      });
    },
    getScores: function (cb) {
      db.getScores(this.users.recent.invoke('toUserData'), cb);
    },
    // control flow
    step: function () {
      var now = Date.now();
      var dt = ((now - this.lastStep) / 1000) * this.timeScalar;
      this.lastStep = now;
      this.users.removeDeadPlayers(dt);
      this.users.invoke('step', dt);
      this.users.step();
      this.trigger('step', this.users.invoke('toFrame'));
    },
    start: function () {
      if (this.running) {
        console.error('game already running!');
      } else {
        this.lastStep = Date.now();
        this.running =
          setInterval(_.bind(this.step, this), 1000 / config.world.fps);
        console.log('game started!');
      }
    },
    stop: function () {
      if (!this.running) {
        console.error('game not currently running!');
      } else {
        console.log('game stopped!');
        clearInterval(this.running);
      }
    },
    bulletTime: function () {
      clearTimeout(this.bulletTimeout);
      this.timeScalar = 0.01;
      var self = this;
      this.bulletTimeout = _.delay(function () { self.timeScalar = 1; }, 500);
    },
    toStep: function () {
      return {
        users: this.users,
        timeScalar: this.timeScalar
      };
    }
  });

  World.Collection = Backbone.Collection.extend({
    model: World
  });

  node ? module.exports = World : app.World = World;

  if (node) return;
  app.world = new World();
  app.world.start();
})();
