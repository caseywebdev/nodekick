'use strict';

var _ = require('underscore');

module.exports = function (files) {
  _.each(files, function (file) { require('./' + file); });
};
