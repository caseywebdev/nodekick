var Backbone = require('backbone');
var config = require('../config');
var _ = require('underscore');

var User = module.exports = Backbone.Model.extend({
  // attributes
  //   handle
  //   x, y
  //   dir (-1, 1)
  //   state (jumping, kicking, standing, dying)
  defaults: {
    x: 400,
    y: -600,
    xv: 0,
    yv: 5,
    dir: 1,
    state: 'jumping'
  },

  step: function (dt) {
    if (this.isJumping()) {
      // apply gravity
      var yv = this.get('yv') + config.world.gravity * dt;
      this.set({
        y: this.get('y') + yv * dt,
        yv: yv
      });
    } else if (this.isKicking()) {
      this.set({
        x: this.get('x') + this.get('xv') * dt,
        y: this.get('y') + this.get('yv') * dt
      });
    }
    if (this.get('y') >= 0) {
      this.set({ y: 0, yv: 0, xv: 0, state: 'standing' });
    }
    if (this.isOffMap()) {
      this.set({ state: 'dying' });
    }
  },

  isOffMap: function() {
    if(!this.isStanding()) return false;

    if(this.get("x") <= config.world.leftEdge) return true;

    if(this.get("x") >= config.world.rightEdge) return true;

    return false;
  },

  toFrame: function () {
    return this.pick('id', 'x', 'y', 'dir', 'state');
  },
  toUserData: function () {
    return this.pick('id', 'username', 'displayName', 'avatar');
  },

  moveLeft: function () { this._kick(-1); },
  moveRight: function () { this._kick(1); },
  _kick: function (dir) {
    if (this.canChangeDir()) this.set('dir', dir);
    if (!this.canKick()) return;
    this.set({
      state: 'kicking',
      xv: dir * config.world.kickPower,
      yv: config.world.kickPower
    });
  },

  moveUp: function () {
    if (!this.canJump()) return;
    this.set({
      state: 'jumping',
      yv: -config.world.jumpPower
    });
  },

  foot: function () {
    if(!this.isKicking()) { return null; }
    var kickerFoot = _.last(this.boxes());
    return kickerFoot;
  },
  
  boxes: function() {
    var kf = this.toFrame();
    var boxesForUser = JSON.parse(
        JSON.stringify(
          config.world.boxes[kf.dir][kf.state]));
    _.each(boxesForUser, function(box) {
      box.x += kf.x;
      box.x2 += kf.x;
      box.y += kf.y;
      box.y2 += kf.y;
    });
    return boxesForUser;
  },

  recordHit: function(foot) {
    var footPoint = foot;
    var _this = this;
    var didDie = false;
    _.each(this.boxes(), function(box) {
      if(_this.hasCollision(footPoint, box)) {
        didDie = true;
      }
    });

    return didDie;
  },

  hasCollision: function(points1, points2) {
    if (points1.x2 < points2.x) return false;
    if (points1.x > points2.x2) return false;
    if (points1.y2 < points2.y) return false;
    if (points1.y > points2.y2) return false;
    return true
  },

  isDead: function () { return this.get('state') === 'dying'; },
  isStanding: function () { return this.get('state') === 'standing'; },
  isJumping: function () { return this.get('state') === 'jumping'; },
  isKicking: function () { return this.get('state') === 'kicking'; },

  canJump: function () { return this.isStanding(); },
  canKick: function () { return this.isJumping(); },

  canChangeDir: function () { return this.isStanding() || this.isJumping(); }
});

User.Collection = Backbone.Collection.extend({
  model: User,
  checkCollisions: function() {
    var kickers = _.filter(this.models, function(model) {
      return model.isKicking();
    });

    var notDeadPlayers = _.filter(this.models, function(model) {
      return !model.isDead();
    });

    var toKill = [];
    
    _.each(kickers, function(kicker) {
      _.each(notDeadPlayers, function(other) {
        if(kicker !== other) {
          if(other.recordHit(kicker.foot())) {
            toKill.push(other);
          }
        }
      });
    });

    _.each(toKill, function(kill) {
      kill.set({ state: "dying" });
    });
  },
  removeDeadPlayers: function() {
    var deadPlayers = _.filter(this.models, function(model) {
      return model.isDead();
    });

    this.remove(deadPlayers);
  }
});
