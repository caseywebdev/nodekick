'require strict';

module.exports = function (req, res, next) {
  if (!req.session.user) return next(401);

  // set up req.user object
  next();
};