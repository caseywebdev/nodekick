var _ = require('underscore')._;

var defaults = {
  session: {
    secret: 'sonny has a nice scarf',
    cookie: {
      maxAge: 60 * 60 * 1000
    }
  },
  world: {
    gravity: 100, // amount of gravity applied per second
    jumpPower: 30,
    kickPower: 30,
    // kickAngle: 0.785, // radians
    fps: 30
  }
};

var env_config = {
  development: {
    port: 8000
  },
  production: {
    port: 80
  }
}[process.env.NODE_ENV || 'development'];

module.exports = _.extend(defaults, env_config);
