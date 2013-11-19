//= require ./model

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var config = node ? require('../server/config') : app.config;
  var Model = node ? require('./model') : app.Model;
  var Box2D = node ? require('box2d.js').Box2D : null;

  var User = Model.extend({
    urlRoot: '/users',

    initialize: function () {
      if (!node) return;
      this.on({
        'change:state change:dir': this.createBody,
        'change:x change:y': this.updateBodyPosition,
        'change:kills': this.updateStreaks,
        'change:killStreak': this.sendKillStreak,
        'change:recentKills': this.sendRecentKills,
        'change:headshots': this.sendHeadshot
      });
    },

    defaults: function () {
      var x = _.random(-100, 100);
      return {
        x: x,
        y: 600,
        xv: 0,
        yv: 0,
        character: 'dive',
        dir: -(x / Math.abs(x)),
        state: 'jumping',
        kills: 0,
        headshots: 0,
        deaths: 0,
        recentKills: 0,
        killStreak: 0,
        touchedGround: false,
        isDead: false
      };
    },

    applyMove: function (move) {
      this['move' + _.str.capitalize(move.get('type'))]();
    },

    step: function (dt) {
      if (this.get('isDead')) return;
      if (this.isJumping()) {
        var yv = this.get('yv') - config.gravity * dt;
        this.set({y: this.get('y') + yv * dt, yv: yv});
      } else if (this.isKicking()) {
        this.set({
          x: this.get('x') + this.get('xv') * dt,
          y: this.get('y') + this.get('yv') * dt
        });
      }
      if (this.get('y') <= 0) {
        this.set({y: 0, yv: 0, xv: 0, state: 'standing', touchedGround: true});
      }
    },

    moveLeft: function () { this.setDir(-1); },

    moveRight: function () { this.setDir(1); },

    setDir: function (dir) {
      if (this.get('isDead')) return;
      if (this.isStanding()) return this.set('dir', dir);
      if (!this.isJumping()) return;
      this.set({
        dir: dir,
        state: 'kicking',
        xv: dir * config.kickPower,
        yv: -config.kickPower
      });
    },

    moveUp: function () {
      if (this.get('isDead')) return;
      if (this.isStanding()) this.set({state: 'jumping', yv: config.jumpPower});
    },

    isStanding: function () { return this.get('state') === 'standing'; },

    isJumping: function () { return this.get('state') === 'jumping'; },

    isKicking: function () { return this.get('state') === 'kicking'; },

    createBody: function () {
      if (this.body) this.world.DestroyBody(this.body);
      var bodyDef = new Box2D.b2BodyDef();
      var vector = bodyDef.get_position();
      vector.set_x(-100);
      bodyDef.set_position(vector);
      bodyDef.set_type(Box2D.b2_dynamicBody);
      var body = this.body = this.world.CreateBody(bodyDef);
      body.user = this;
      this.updateBodyPosition();
      var dir = this.get('dir');
      var hitBoxScalar = config.hitBoxScalar;
      _.each(config.hitBoxes[this.get('state')], function (def) {
        var fixtureDef = new Box2D.b2FixtureDef();
        fixtureDef.set_isSensor(true);
        var filter = fixtureDef.get_filter();
        filter.set_categoryBits(def.filter.categoryBits);
        filter.set_maskBits(def.filter.maskBits);
        var vectors = [];
        for (var i = 0, l = def.shape.length; i < l; i += 2) {
          var x = ((dir === -1 ? 1000 : 0) + dir * def.shape[i]) * hitBoxScalar;
          var y = (2000 - def.shape[i + 1]) * hitBoxScalar;
          vectors.push(new Box2D.b2Vec2(x, y));
        }
        if (dir === 1) vectors.reverse();
        fixtureDef.set_shape(Box2D.createPolygonShape(vectors));
        body.CreateFixture(fixtureDef);
      });
      this.updateBodyPosition();
    },

    updateBodyPosition: function () {
      var vector = this.body.GetPosition();
      vector.set_x(this.get('x'));
      vector.set_y(this.get('y'));
      this.body.SetTransform(vector, 0);
    },

    updateStreaks: function () {
      this.incr('recentKills');
      this.incr('killStreak');
      this.clearRecentKills();
    },

    clearRecentKills: _.debounce(function () {
      this.set('recentKills', 0);
    }, config.recentKillDuration),

    sendKillStreak: function () {
      switch (this.get('killStreak')) {
      case 3:
        return this.sendMessage('Killing Streak!', 'killing-streak');
      case 6:
        return this.sendMessage('Rampage!', 'rampage');
      case 9:
        return this.sendMessage('Dominating!', 'dominating');
      case 12:
        return this.sendMessage('Unstoppable!', 'unstoppable');
      case 15:
        return this.sendMessage('Godlike!', 'godlike');
      }
    },

    sendRecentKills: function () {
      switch (this.get('recentKills')) {
      case 0:
        return;
      case 1:
        if (!this.get('touchedGround')) {
          this.sendMessage('Death From Above!', 'death-from-above');
        }
        return;
      case 2:
        return this.sendMessage('Double Kill!', 'double-kill');
      case 3:
        return this.sendMessage('Triple Kill!', 'triple-kill');
      }
      this.sendMessage('Monster Kill!', 'monster-kill');
    },

    sendHeadshot: function () { this.sendMessage('Headshot!', 'headshot'); },

    sendMessage: function (text, soundId) {
      var Message = node ? require('./message') : app.Message;
      this.trigger('message', new Message({
        user: this,
        text: text,
        soundId: soundId
      }));
    },

    toFrame: function () { return this.attributes; },

    toJSON: function () {
      return this.pick(
        'id',
        'username',
        'displayName',
        'avatar',
        'kills',
        'deaths',
        'headshots'
      );
    }
  });

  User.Collection = Model.Collection.extend({
    model: User
  });

  node ? module.exports = User : app.User = User;
})();
