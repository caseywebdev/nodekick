(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var Backbone = node ? require('backbone') : window.Backbone;
  var config = node ? require('../server/config') : window.config;

  var User = Backbone.Model.extend({
    // attributes
    //   handle
    //   x, y
    //   dir (-1, 1)
    //   state (jumping, kicking, standing, dead)
    initialize: function () {
      this.triggerMulti = _.debounce(this.triggerMulti, config.world.multiTime);
    },
    defaults: function () {
      var randomX = _.random(config.world.leftEdge, config.world.rightEdge);
      var direction = 1;

      if(randomX > ((config.world.rightEdge - config.world.leftEdge) / 2)) {
        direction = -1;
      }

      return {
        x: randomX,
        y: -600,
        xv: 0,
        yv: 5,
        dir: direction,
        state: 'jumping',
        deathCooldown: 1,
        deathState: 'standing',
        streak: 0,
        multis: 0,
        touchedGround: false
      };
    },

    hasTouchedGround: function() {
      return this.get("touchedGround");
    },

    hasKilledFromAbove: function () {
      return this.set({ touchedGround: true });
    },

    registerKill: function() {
      this.set({ multis: this.get("multis") + 1 });
      this.set({ streak: this.get("streak") + 1 });
    },

    triggerMulti: function (cb) {
      var multis = this.get('multis');
      if (multis >= 2) cb(multis);
      this.set('multis', 0);
    },

    resetStreak: function() {
      this.set({ streak: 0 });
    },

    step: function (dt) {
      if(this.isDead()) return;

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

      if (this.get('y') >= 0 && !this.missedGround()) {
        this.set({ y: 0, yv: 0, xv: 0, state: 'standing', touchedGround: true });
      }

      if (this.missedGround()) {
        this.set({ state: 'dead', deathState: 'kicking' });
      }

      if(this.offStage()) {
        this.set({ state: 'dead', deathState: 'kicking' });
      }
    },

    offStage: function() {
      if(this.get("x") <= config.world.left) return true;

      if(this.get("x") >= config.world.right) return true;

      return false;
    },

    missedGround: function() {
      if(!this.isStanding()) return false;

      if(this.get("x") <= config.world.leftEdge) return true;

      if(this.get("x") >= config.world.rightEdge) return true;

      return false;
    },

    toFrame: function () {
      return this.pick('id', 'x', 'y', 'dir', 'state', 'deathCooldown', 'deathState');
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

    isHeadShot: function(foot) {
      return this.hasCollision(foot, _.first(this.boxes()));
    },

    recordHit: function(foot) {
      if(this.isDead()) return false;
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

    isDead: function () { return this.get('state') === 'dead'; },
    isStanding: function () { return this.get('state') === 'standing'; },
    isJumping: function () { return this.get('state') === 'jumping'; },
    isKicking: function () { return this.get('state') === 'kicking'; },

    canJump: function () { return this.isStanding(); },
    canKick: function () { return this.isJumping(); },

    canChangeDir: function () { return this.isStanding() || this.isJumping(); }
  });

  User.Collection = Backbone.Collection.extend({
    model: User,
    initialize: function (__, options) {
      if (options && options.recent) return;
      this.recent = new User.Collection(this.models, {recent: true});
      this.recent.timeouts = {};
      this.recent.listenTo(this, {
        add: function (model) {
          clearTimeout(this.timeouts[model.id]);
          this.add(model);
        },
        remove: function (model) {
          this.timeouts[model.id] =
            setTimeout(this.remove.bind(this, model), 5 * 60 * 1000);
        }
      });
    },
    step: function () {
      var collisionResults = this.checkCollisions();
      this.broadcastMessages(collisionResults);
    },
    checkCollisions: function() {
      var kickers = _.filter(this.models, function (model) {
        return model.isKicking();
      });

      var notDeadPlayers = _.filter(this.models, function (model) {
        return !model.isDead();
      });

      var collisionResults = [];

      var users = this;

      _.each(kickers, function (kicker) {
        _.each(notDeadPlayers, function (other) {
          if (kicker !== other && other.recordHit(kicker.foot())) {
            collisionResults.push({
              killer: kicker,
              killed: other,
              headShot: other.isHeadShot(kicker.foot()),
              deathFromAbove: !kicker.hasTouchedGround()
            });

            if (!kicker.hasTouchedGround()) kicker.hasKilledFromAbove();
            kicker.registerKill();
            kicker.triggerMulti(function (multis) {
              users.trigger('message', {
                type: 'multikill',
                text: 'multikill',
                user: kicker.toJSON()
              });
            });
            other.resetStreak();
          }
        });
      });

      _.each(collisionResults, function (kill) {
        this.trigger('kill', kill);
        kill.killed.set({ deathState: kill.killed.get("state"), state: "dead" });
      }, this);
      return collisionResults;
    },
    broadcastMessages: function (collisionResults) {
      var users = this;

      _.each(collisionResults, function (kill) {
        if (kill.headShot) {
          users.trigger('message', {
            type: 'headshot',
            text: 'headshot',
            user: kill.killer.toJSON()
          });
        }
        if (kill.killer.get("streak") >= config.world.minStreak) {
          users.trigger('message', {
            type: 'streak',
            text: 'killing streak',
            user: kill.killer.toJSON()
          });
        }

        if (kill.deathFromAbove) {
          users.trigger('message', {
            type: 'deathfromabove',
            text: 'death from above',
            user: kill.killer.toJSON()
          });
        }
      }, this);

      return collisionResults;
    },
    removeDeadPlayers: function (dt) {
      var deadPlayers = _.filter(this.models, function (model) {
        return model.isDead();
      });

      _.each(deadPlayers, function (player) {
        player.set({ deathCooldown: player.get("deathCooldown") - dt });
      });

      var deadAndCooldownComplete = _.filter(deadPlayers, function (model) {
        return model.get("deathCooldown") < 0;
      });

      this.remove(deadAndCooldownComplete);
    }
  });

  node ? module.exports = User : app.User = User;
})();
