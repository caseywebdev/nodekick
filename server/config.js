var _ = require('underscore')._;
var Box2D = require('box2d.js').Box2D;
Box2D.createPolygonShape = function (vectors) {
  var shape = new Box2D.b2PolygonShape(vectors);
  var buffer = Box2D.allocate(vectors.length * 8, 'float', Box2D.ALLOC_STACK);
  _.each(vectors, function (vector, i) {
    Box2D.setValue(buffer + (i * 8), vector.get_x(), 'float');
    Box2D.setValue(buffer + (i * 8) + 4, vector.get_y(), 'float');
    Box2D.destroy(vector);
  });
  shape.Set(Box2D.wrapPointer(buffer, Box2D.b2Vec2), vectors.length);
  return shape;
};

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
  recentKillDuration: 1000 * 3,
  recentUserDuration: 1000 * 60 * 5,
  deathDuration: 1000,
  fps: 60,
  mps: 15,
  hitBoxes: require('../images/hit-boxes'),
  hitBoxScalar: 0.2
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
