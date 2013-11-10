'use strict';


module.exports = function (req, res, next) {

  // Generate a correct URL and match it to the current request. If they don't
  // match, redirect. This keeps resources per URL unique and that's bueno.
  var proto = req.protocol;
  var path = req.path.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
  var query = req.url.replace(/^[^?]*/, '');
  var current = proto + '://' + req.headers.host + req.url;
  var correct = (req.app.get('url') + path).toLowerCase() + query;
  if (current === correct) return next();
  res.redirect(correct, 301);
};
