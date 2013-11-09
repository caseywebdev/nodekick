'use strict';

module.exports = function (app) {
  app.get('/sign-out', require('./sign-out'));
  app.namespace('/auth', function () {
    require('./twitter')(app);
  });
};
