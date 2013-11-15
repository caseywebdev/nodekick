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

  var World = Model.extend({
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
      this.b2World = new Box2D.b2World(new Box2D.b2Vec2(0, 0));
      this.userTimeouts = [];
      var users = this.get('users');
      var recentUsers = this.get('recentUsers');
      this.listenTo(users, {
        add: function (user) {
          clearTimeout(this.userTimeouts[user.id]);
          this.get('recentUsers').add(user);
          user.createBody(this.b2World);
        },
        remove: function (user) {
          this.userTimeouts[user.id] = _.delay(
            _.bind(recentUsers.remove, recentUsers, user),
            config.recentUserDuration
          );
          this.b2World.DestroyBody(user.body);
        },
        'change:isDead': function (user) {
          _.delay(_.bind(users.remove, users, user), config.deathDuration);
        }
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
      this.trigger('step', dt);
    },

    start: function () {
      this.stop();
      this.lastStep = Date.now();
      this.intervalId = setInterval(this.step, 1000 / config.fps);
    },

    stop: function () { clearInterval(this.intervalId); },

    toJSON: function () {
      return _.extend({
        recentUsers: this.get('recentUsers'),
        users: this.get('users')
      }, this.attributes);
    },

    kill: function (userA, userB, isHeadshot) {
      userA.incr('kills');
      if (isHeadshot) userA.incr('headshots');
      userB.incr('deaths');
      userB.set({isDead: true, killForce: userA.pick('xv', 'yv')});
    },

    checkCollisions: function () {
      if (!node) return;
      this.b2World.Step();
      var contact = this.b2World.GetContactList();
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
        if (aIsFoot && !userB.get('isDead')) this.kill(userA, userB, bIsHead);
        if (bIsFoot && !userA.get('isDead')) this.kill(userB, userA, aIsHead);
      });
    }
  });

  World.Collection = Model.Collection.extend({
    model: World
  });

  node ? module.exports = World : app.World = World;
})();
