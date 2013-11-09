var Backbone = require('backbone');
var config = require('../config');

var User = module.exports = Backbone.Model.extend({
  // attributes
  //   handle
  //   x, y
  //   dir (-1, 1)
  //   state (j, k, s, d)
  defaults: {
    x: 10,
    y: 0,
    xv: 0,
    yv: 0,
    dir: 1,
    state: 's'
  },

  step: function (world) {
    var dt = world.dt;
    if (this.isJumping()) {
      // apply gravity
      var yv = this.get('yv') - config.world.gravity * dt;
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
    if (this.get('y') < 0) {
      this.set({y: 0, yv: 0, xv: 0, state: 's'});
    }
  },
  toFrame: function () {
    return {
      u: this.id,
      x: this.get('x'),
      y: this.get('y'),
      d: this.get('dir'),
      s: this.get('state')
    };
  },

  moveLeft: function () { this._kick(-1); },
  moveRight: function () { this._kick(1); },
  _kick: function (dir) {
    if (this.canChangeDir()) this.set('dir', dir);
    if (!this.canKick()) return;
    this.set({
      state: 'k',
      xv: dir * config.world.kickPower,
      yv: -config.world.kickPower
    });
  },

  moveUp: function () {
    if (!this.canJump()) return;
    this.set({
      state: 'j',
      yv: config.world.jumpPower
    });
  },

  isDead: function () { return this.get('state') === 'd'; },
  isStanding: function () { return this.get('state') === 's'; },
  isJumping: function () { return this.get('state') === 'j'; },
  isKicking: function () { return this.get('state') === 'k'; },

  canJump: function () { return this.isStanding(); },
  canKick: function () { return this.isJumping(); },

  canChangeDir: function () { return this.isStanding() || this.isJumping(); }
});

User.Collection = Backbone.Collection.extend({
  model: User
});
