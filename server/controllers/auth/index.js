'use strict';

module.exports = function (app) {
  app.namespace('/auth', function () {
    require('./twitter')(app);
  });
};
