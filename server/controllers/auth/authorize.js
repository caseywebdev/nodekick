'use strict';

var passport = require('passport');

module.exports = [
  passport.authenticate('twitter'),
  function (req, res, next) {
    console.log(req.session);
    if (!req.session.user) return next(401);
    // set up req.user object
    next();
  }
];

