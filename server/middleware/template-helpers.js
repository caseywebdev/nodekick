'use strict';

var _ = require('underscore');
var config = require('../config');

module.exports = function (req, res, next) {

  // Set helpful locals for templates.
  res.locals._ = _;
  res.locals.config = config;
  res.locals.req = req;
  res.locals.variable = 'o';
  next();
};
