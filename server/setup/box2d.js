'use strict';

var _ = require('underscore');
var Box2D = require('box2d.js').Box2D;

Box2D.createPolygonShape = function (vertices) {
  var buffer = Box2D.allocate(vertices.length * 8, 'float', Box2D.ALLOC_STACK);
  _.each(vertices, function (vertex, i) {
    Box2D.setValue(buffer + (i * 8), vertex.x, 'float');
    Box2D.setValue(buffer + (i * 8) + 4, vertex.y, 'float');
  });
  var shape = new Box2D.b2PolygonShape();
  shape.Set(Box2D.wrapPointer(buffer, Box2D.b2Vec2), vertices.length);
  return shape;
};
