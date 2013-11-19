'use strict';

var _ = require('underscore');
var Backbone = require('backbone');
require('backbone-relations');
var config = require('../config');
var redis = require('redis');

Backbone.sync = function (method, model, options) {
  var key = config.redis.prefix + _.result(model, 'url');
  var done = function (er, res) {
    if (er) {
      options.error(er);
      if (options.cb) options.cb(er, model, er, options);
    } else {
      try { res = JSON.parse(res); } catch (er) {}
      options.success(res);
      if (options.cb) options.cb(null, model, res, options);
    }
  };
  switch (method) {
  case 'update':
    return redis.client.set(key, JSON.stringify(model), done);
  case 'read':
    return redis.client.get(key, done);
  case 'delete':
    return redis.client.del(key, done);
  }
};
