//= require ./model

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var config = node ? require('../server/config') : app.config;
  var Model = node ? require('./model') : app.Model;

  var User = Model.extend({
    initialize: function () {
      this.triggerMulti = _.debounce(this.triggerMulti, config.multiTime);
    },

    defaults: function () {
      var x = _.random(-100, 100);
      return {
        x: x,
        y: -600,
        xv: 0,
        yv: 5,
        character: 'dive',
        dir: -(x / Math.abs(x)),
        state: 'jumping',
        touchedGround: false
      };
    },

    applyMove: function (move) {
      this['move' + _.str.capitalize(move.get('type'))]();
    },

    step: function (dt) {
      if (this.isJumping()) {
        var yv = this.get('yv') + config.gravity * dt;
        this.set({y: this.get('y') + yv * dt, yv: yv});
      } else if (this.isKicking()) {
        this.set({
          x: this.get('x') + this.get('xv') * dt,
          y: this.get('y') + this.get('yv') * dt
        });
      }
      if (this.get('y') < 0) return;
      this.set({y: 0, yv: 0, xv: 0, state: 'standing', touchedGround: true});
    },

    moveLeft: function () { this.setDir(-1); },

    moveRight: function () { this.setDir(1); },

    setDir: function (dir) {
      if (this.canChangeDir()) this.set('dir', dir);
      if (!this.canKick()) return;
      this.set({
        state: 'kicking',
        xv: dir * config.kickPower,
        yv: config.kickPower
      });
    },

    moveUp: function () {
      if (this.canJump()) this.set({state: 'jumping', yv: -config.jumpPower});
    },

    isStanding: function () { return this.get('state') === 'standing'; },

    isJumping: function () { return this.get('state') === 'jumping'; },

    isKicking: function () { return this.get('state') === 'kicking'; },

    canJump: function () { return this.isStanding(); },

    canKick: function () { return this.isJumping(); },

    canChangeDir: function () { return this.isStanding() || this.isJumping(); }
  });

  User.Collection = Model.Collection.extend({
    model: User
  });

  node ? module.exports = User : app.User = User;
})();
