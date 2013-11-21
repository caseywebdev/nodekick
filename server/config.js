var _ = require('underscore');

var env = process.env.NODE_ENV || 'development';

var defaults = {
  env: env,
  session: {
    secret: 'sonny has a nice scarf',
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
  },
  game: {
    gravity: 6000,
    jumpPower: 3000,
    kickPower: 1400,
    recentKillDuration: 1000 * 3,
    recentUserDuration: 1000 * 60 * 5,
    deathDuration: 1000 * 1,
    bulletTimeDuration: 1000 * 0.5,
    fps: 60,
    mps: 60,
    hitBoxes: require('./hit-boxes'),
    hitBoxScalar: 0.2,
    width: 2880,
    height: 1620
  },
  redis: {
    url: '',
    prefix: 'nodekick:'
  }
};

module.exports = _.extend(defaults, ({
  development: {
    port: 3005,
    url: 'http://nodekick.com.dev',
    passport: {
      twitter: {
        consumerKey: 'tNvNfVCJCr6nMa5c4UP03w',
        consumerSecret: '2aHTJ3yTPrUuio0Aw8kq7sq2okVAAwqb4pYFuJhE'
      }
    }
  },
  production: {
    port: process.env.PORT || 80,
    url: 'http://nodekick.herokuapp.com',
    session: _.extend({}, defaults.session, {
      secret: process.env.SESSION_SECRET
    }),
    redis: {
      url: process.env.REDIS_URL,
      prefix: ''
    },
    passport: {
      twitter: {
        consumerKey: process.env.TWITTER_CONSUMER_KEY,
        consumerSecret: process.env.TWITTER_CONSUMER_SECRET
      }
    }
  }
})[env]);
