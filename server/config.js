var _ = require('underscore')._;
var Box2D = require('box2d.js').Box2D;
Box2D.createPolygonShape = function (vectors) {
  var shape = new Box2D.b2PolygonShape();
  var buffer = Box2D.allocate(vectors.length * 8, 'float', Box2D.ALLOC_STACK);
  _.each(vectors, function (vector, i) {
    Box2D.setValue(buffer + (i * 8), vector.get_x(), 'float');
    Box2D.setValue(buffer + (i * 8) + 4, vector.get_y(), 'float');
  });
  shape.Set(Box2D.wrapPointer(buffer, Box2D.b2Vec2), vectors.length);
  return shape;
};

var env = process.env.NODE_ENV || 'development';

var hitBoxData = require('../images/hit-boxes');
var world = new Box2D.b2World(new Box2D.b2Vec2(0, 0));
var hitBoxScalar = 0.2;

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
  hitBoxes: _.reduce(hitBoxData, function (hitBoxes, defs, state) {
    var bodyDef = new Box2D.b2BodyDef();
    bodyDef.set_type(Box2D.b2_dynamicBody);
    var body = world.CreateBody(bodyDef);
    _.each(defs, function (def) {
      var fixtureDef = new Box2D.b2FixtureDef();
      fixtureDef.set_isSensor(true);
      var filter = fixtureDef.get_filter();
      filter.set_categoryBits(def.filter.categoryBits);
      filter.set_maskBits(def.filter.maskBits);
      var vectors = [];
      for (var i = 0, l = def.shape.length; i < l; i += 2) {
        var x = def.shape[i] * hitBoxScalar;
        var y = def.shape[i + 1] * hitBoxScalar;
        vectors.push(new Box2D.b2Vec2(x, y));
      }
      fixtureDef.set_shape(Box2D.createPolygonShape(vectors));
      body.CreateFixture(fixtureDef);
    });
    hitBoxes[state] = body;
    return hitBoxes;
  }, {})
};

var s = Date.now();
world.Step();
var c = world.GetContactList();
while (c.a) {
  console.log(
    c.IsTouching(),
    c.GetFixtureA().GetFilterData().get_categoryBits(),
    c.GetFixtureB().GetFilterData().get_categoryBits());
  c = c.GetNext();
}
console.log(Date.now() - s);
var s = Date.now();
defaults.hitBoxes.jumping.SetTransform(new Box2D.b2Vec2(0, 100), 0);
world.Step();
var c = world.GetContactList();
while (c.a) {
  console.log(
    c.IsTouching(),
    c.GetFixtureA().GetFilterData().get_categoryBits(),
    c.GetFixtureB().GetFilterData().get_categoryBits());
  c = c.GetNext();
}
console.log(Date.now() - s);


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
