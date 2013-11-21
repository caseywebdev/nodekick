'use strict';

var superagent = require('superagent');
var User = require('../../../models/user');

module.exports = function (req, res, next) {
  (new User({id: req.params.id})).fetch({cb: function (er, user) {
    if (er) return next(er);
    var avatar = user.get('avatar');
    if (!avatar) return next(404);
    superagent.get(avatar).end(function (er, imgRes) {
      if (er) return next(er);
      res.set(imgRes.headers);
      imgRes.pipe(res);
    });
  }});
};
