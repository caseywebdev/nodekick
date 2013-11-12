'use strict';

module.exports = function (app) {
  app.all('*', require('./not-found'));
  app.use(require('./handler'));
};
