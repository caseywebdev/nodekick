var db = require('../../db');
var _ = require('underscore');
var agent = require('superagent').agent();

module.exports = function (app) {
  app.get('/avatars/:id', function (req, res) {
    db.findUser(req.params.id, function (err, user) {
      if (err || !user) return res.send(404);
      agent.get(user.avatar).end(function (err, imgRes) {
        if (err || imgRes.status >= 400) return res.send(404);
        var headers = _.pick(imgRes.headers, 'content-type', 'etag', 'expires', 'content-length');
        res.set(headers);
        imgRes.pipe(res);
      });
    });
  });
};
