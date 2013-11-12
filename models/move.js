//= require ./model

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var Model = node ? require('./model') : app.Model;

  var Move = Model.extend({
    url: '/moves',

    isValid: function () { return _.contains(Move.TYPES, this.get('type')); }
  }, {
    TYPES: ['up', 'left', 'right']
  });

  Move.Collection = Model.Collection.extend({
    model: Move,
  });

  node ? module.exports = Move : app.Move = Move;
})();
