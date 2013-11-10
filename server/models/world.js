'use strict';

var _ = require('underscore');
var config = require('../config');
var Backbone = require('backbone');
var User = require('./user');
var db = require('../db');

var World = module.exports = Backbone.Model.extend({
  timeScalar: 1,
  initialize: function () {
    this.users = new User.Collection();
    var world = this;
    this.users.on('kill', function (kill) {
      world.bulletTime();
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
    this.users.checkCollisions();
    this.trigger('step', this.users.invoke('toFrame'));
  },
  start: function () {
    if (this.running) {
      console.error('game already running!');
    } else {
      this.lastStep = Date.now();
      this.running = setInterval(this.step.bind(this), 1000 / config.world.fps);
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
    this.timeScalar = 0.05;
    var self = this;
    this.bulletTimeout = _.delay(function () { self.timeScalar = 1; }, 1000);
  }
});

World.Collection = Backbone.Collection.extend({
  model: World
});
