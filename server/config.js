var _ = require('underscore')._;

var defaults = {
  session: {
    secret: 'sonny has a nice scarf',
    cookie: {
      maxAge: 60 * 60 * 1000
    }
  },
  world: {
    gravity: 3000, // amount of gravity applied per second
    jumpPower: 1200,
    kickPower: 1500,
    fps: 30
  }
};

var env_config = {
  development: {
    port: 8000,
    twitter: {
      consumerKey: 'CKmeGkSx1X8j2KEtHZDGw',
      consumerSecret: 'ExDAPkeVGHwQVp5bwKMdyUt9xQbnJ2IpjhhvAOV3p14',
      callbackURL: 'http://nodekick.dev:8000/auth/twitter/callback'
    }
  },
  production: {
    port: 80,
    twitter: {
      consumerKey: 'g5PWWQH4zGEiFZ7Zl2W2sQ',
      consumerSecret: 'gWL1CSM1WjxkVfMPra1tBvYdYj38MefSGB2THNDEjhY',
      callbackURL: 'http://team-us.2013.nodeknockout.com/auth/twitter/callback'
    }
  }
}[process.env.NODE_ENV || 'development'];

module.exports = _.extend(defaults, env_config);
