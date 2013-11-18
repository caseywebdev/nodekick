'use strict';

var crypto = require('crypto');
var redis = require('redis');

module.exports = function (req, res, next) {
  var rand = crypto.randomBytes(32).toString('base64');
  redis.client.set('liveKey:' + rand, req.user.id, 'EX', 10, function (er) {
    if (er) return next(er);
    res.send(rand);
  });
};
