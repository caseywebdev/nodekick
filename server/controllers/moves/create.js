var _ = require('underscore');
var Move = require('../../../models/move');

module.exports = function (req, res, next) {
  var move = new Move(_.pick(req.body, 'type'));
  if (!move.isValid()) return next(400);
  var users = req.app.world.get('users');
  if (!users.get(req.user)) {
    if (move.get('type') !== 'up') return next(403);
    users.add(req.user);
  }
  req.user.applyMove(move);
  res.send(move);
};
