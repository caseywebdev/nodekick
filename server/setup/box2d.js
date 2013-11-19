'use strict';

var _ = require('underscore');
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
