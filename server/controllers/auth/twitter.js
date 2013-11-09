'use strict';

var passport = require('passport');

module.exports = function (app) {
  app.namespace('/twitter', function () {
    app.get('/', passport.authenticate('twitter'));

    app.get('/callback', passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/'
    }));
  });
};
