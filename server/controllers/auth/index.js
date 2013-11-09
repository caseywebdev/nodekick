'use strict';

module.exports = function (app) {
  app.namespace('/auth', function () {
    app.get('/sign-out', require('./sign-out'));
    require('./twitter')(app);
  });
};
