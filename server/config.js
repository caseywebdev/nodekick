var _ = require('underscore')._;

var env = process.env.NODE_ENV || 'development';

var defaults = {
  env: env,
  session: {
    secret: 'sonny has a nice scarf',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
  },
  gravity: 7000,
  jumpPower: 3000,
  kickPower: 1500,
  recentKillDuration: 3000,
  fps: 60,
  hitBoxes: require('../images/hit-boxes')
};

module.exports = _.extend(defaults, ({
  development: {
    port: 3005,
    url: 'http://nodekick.com.dev',
    twitter: {
      consumerKey: 'tNvNfVCJCr6nMa5c4UP03w',
      consumerSecret: '2aHTJ3yTPrUuio0Aw8kq7sq2okVAAwqb4pYFuJhE',
      callbackURL: 'http://nodekick.com.dev/auth/twitter/callback'
    }
  },
  production: {
    port: 80,
    url: 'http://nodekick.com',
    twitter: {
      consumerKey: 'g5PWWQH4zGEiFZ7Zl2W2sQ',
      consumerSecret: 'gWL1CSM1WjxkVfMPra1tBvYdYj38MefSGB2THNDEjhY',
      callbackURL: 'http://nodekick.com/auth/twitter/callback'
    }
  }
})[env]);
