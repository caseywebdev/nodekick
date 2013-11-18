'use strict';

var crypto = require('crypto');
var redis = require('redis');

module.exports = function (req, res, next) {
  var rand = crypto.randomBytes(32).toString('base64');
  var id = (req.user && req.user.id) || 0;
  redis.client.set('liveKey:' + rand, id, 'EX', 10, function (er) {
    if (er) return next(er);
    res.send(rand);
  });
};
