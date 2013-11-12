'use strict';

module.exports = function (app) {
  app.del('/sessions', require('../sessions/authorize'), require('./destroy'));
};
