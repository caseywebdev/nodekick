'use strict';

module.exports = function (app) {
  app.namespace('/users', function () {
    app.namespace('/:id', function () {
      app.get('/avatar', require('./avatar'));
    });
  });
};
