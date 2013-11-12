'use strict';

var fs = require('fs');

var abs = function (path) { return __dirname + '/../../views/' + path; };

module.exports = function (req, res, next) {
  var ext = '.' + req.app.get('view engine');
  if (req.path.match(/\/_/)) return next();
  var path = 'pages' + req.path + ext;
  fs.stat(abs(path), function (er) {
    if (!er) return res.render(path);
    path = 'pages' + req.path + '/_index' + ext;
    fs.stat(abs(path), function (er) {
      if (er) return next();
      res.render(path);
    });
  });
};
