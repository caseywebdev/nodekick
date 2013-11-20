//= require ./model

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var config = node ? require('../server/config') : app.config;
  var db = node ? require('../server/db') : null;
  var Model = node ? require('./model') : app.Model;
  var Box2D = node ? require('box2d.js').Box2D : null;

  var Game = Model.extend({
    relations: {
      users: {hasMany: 'user'},
      recentUsers: {hasMany: 'user'}
    },

    defaults: {
      timeScalar: 1
    },

    initialize: function () {
      _.bindAll(this, 'step');
      this.start();
      if (!node) return;
      this.world = new Box2D.b2World(new Box2D.b2Vec2(0, 0));
      this.userTimeouts = [];
      var users = this.get('users');
      var recentUsers = this.get('recentUsers');
      this.listenTo(users, {
        add: function (user) {
          clearTimeout(this.userTimeouts[user.id]);
          this.get('recentUsers').add(user);
          user.world = this.world;
          user.createBody();
        },
        remove: function (user) {
          this.userTimeouts[user.id] = _.delay(
            _.bind(recentUsers.remove, recentUsers, user),
            config.recentUserDuration
          );
          this.world.DestroyBody(user.body);
        },
        'change:isDead': function (user) {
          _.delay(_.bind(users.remove, users, user), config.deathDuration);
        },
        message: _.partial(this.trigger, 'message')
      });
    },

    getScores: function (cb) {
      db.getScores(this.get('recentUsers').invoke('toUserData'), cb);
    },

    step: function () {
      var now = Date.now();
      var dt = ((now - this.lastStep) / 1000) * this.get('timeScalar');
      this.lastStep = now;
      this.get('users').invoke('step', dt);
      this.checkCollisions();
      this.checkOutOfBounds();
      this.trigger('step', dt);
    },

    start: function () {
      this.stop();
      this.lastStep = Date.now();
      this.intervalId = setInterval(this.step, 1000 / config.fps);
    },

    stop: function () { clearInterval(this.intervalId); },

    toFrame: function () {
      return _.extend({
        recentUsers: this.get('recentUsers').invoke('toFrame'),
        users: this.get('users').invoke('toFrame')
      }, this.attributes);
    },

    kill: function (userA, userB, isHeadshot) {
      userA.incr('deaths');
      var killForce;
      var User = require('./user');
      if (userB instanceof User) {
        if (isHeadshot) userB.incr('headshots');
        userB.incr('kills');
        killForce = userB.pick('xv', 'yv');
      }
      userA.set({isDead: true, killForce: killForce || userB});

      // Bullet time is badass but can be really annoying when there are other
      // players around. Let's only trigger bullet time when there is one living
      // player (or none like when players kill each other).
      // if (this.get('users').where({isDead: false}).length > 1) return;
      // this.bulletTime();
    },

    checkCollisions: function () {
      if (!node) return;
      this.world.Step();
      var contact = this.world.GetContactList();
      var contacts = [];
      while (contact.a) {
        if (contact.IsTouching()) contacts.push(contact);
        contact = contact.GetNext();
      }

      // Sort so that head fixtures are iterated through first. This ensures
      // that if the foot was touching the head fixture and a body fixture that
      // the head will win.
      contacts.sort(function (a, b) {
        var aA = !!(a.GetFixtureA().GetFilterData().get_categoryBits() & 2);
        var aB = !!(a.GetFixtureB().GetFilterData().get_categoryBits() & 2);
        var bA = !!(b.GetFixtureA().GetFilterData().get_categoryBits() & 2);
        var bB = !!(b.GetFixtureB().GetFilterData().get_categoryBits() & 2);
        return aA || aB ? -1 : bA || bB ? 1 : 0;
      });
      _.each(contacts, function (contact) {
        var fixtureA = contact.GetFixtureA();
        var fixtureB = contact.GetFixtureB();
        var userA = fixtureA.GetBody().user;
        var userB = fixtureB.GetBody().user;
        var aIsFoot = !!(fixtureA.GetFilterData().get_categoryBits() & 4);
        var aIsHead = !!(fixtureA.GetFilterData().get_categoryBits() & 2);
        var bIsFoot = !!(fixtureB.GetFilterData().get_categoryBits() & 4);
        var bIsHead = !!(fixtureB.GetFilterData().get_categoryBits() & 2);
        if (aIsFoot && !userB.get('isDead')) this.kill(userB, userA, bIsHead);
        if (bIsFoot && !userA.get('isDead')) this.kill(userA, userB, aIsHead);
      }, this);
    },

    checkOutOfBounds: function () {
      if (!node) return;
      this.get('users').each(function (user) {
        if (user.get('isDead')) return;
        var x = user.get('x');
        var absX = Math.abs(x);
        var side = x / absX;
        if (absX <= 1000) return;
        this.kill(user, {xv: -(side * 4000), yv: -user.get('yv')});
      }, this);
    },

    bulletTime: function () {
      clearTimeout(this.bulletTimeTimeoutId);
      this.set('timeScalar', 0.01);
      this.bulletTimeTimeoutId = _.delay(
        _.bind(this.set, this, 'timeScalar', 1),
        config.bulletTimeDuration
      );
    }
  });

  Game.Collection = Model.Collection.extend({
    model: Game
  });

  node ? module.exports = Game : app.Game = Game;
})();
