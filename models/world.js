//= require ./user

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var config = node ? require('../server/config') : app.config;
  var db = node ? require('../server/db') : null;
  var Model = node ? require('./model') : app.Model;

  var World = Model.extend({
    relations: {
      users: {hasMany: 'user'},
      recentUsers: {hasMany: 'user'},
    },

    defaults: {
      timeScalar: 1
    },

    initialize: function () {
      _.bindAll(this, 'step');
      this.userTimeouts = [];
      var recentUsers = this.get('recentUsers');
      this.listenTo(this.get('users'), {
        add: function (user) {
          clearTimeout(this.userTimeouts[user.id]);
          this.get('recentUsers').add(user);
        },
        remove: function (user) {
          this.userTimeouts[user.id] = setTimeout(
            recentUsers.remove.bind(recentUsers, user),
            config.recentUserDuration
          );
        }
      });
      this.start();
    },

    getScores: function (cb) {
      db.getScores(this.get('recentUsers').invoke('toUserData'), cb);
    },

    step: function () {
      var now = Date.now();
      var dt = ((now - this.get('lastStep')) / 1000) * this.get('timeScalar');
      this.set('lastStep', now);
      var users = this.get('users');
      users.removeDeadPlayers(dt);
      users.invoke('step', dt);
      users.step();
      this.trigger('step', users.invoke('toFrame'));
    },

    start: function () {
      this.stop();
      this.lastStep = Date.now();
      this.intervalId = setInterval(this.step, 1000 / config.fps);
    },

    stop: function () { clearInterval(this.intervalId); },

    toJSON: function () {
      return _.extend({
        users: this.get('users'),
        recentUsers: this.get('recentUsers')
      }, this.attributes);
    }
  });

  World.Collection = Model.Collection.extend({
    model: World
  });

  node ? module.exports = World : app.World = World;
})();
