'use strict';

var config = require('../config');
var Backbone = require('backbone');
var User = require('./user');

var World = module.exports = Backbone.Model.extend({
  initialize: function () {
    this.users = new User.Collection();
  },
  // control flow
  step: function () {
    var now = Date.now();
    var dt = (now - this.lastStep) / 1000;
    this.lastStep = now;
    this.users.invoke('step', dt);
    // this.users.checkCollisions();
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
  }
});

World.Collection = Backbone.Collection.extend({
  model: World
});
