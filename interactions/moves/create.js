var _ = require('underscore');
var Move = require('../../models/move');
var Interaction = require('interaction');

module.exports = new Interaction({
  run: function (options, cb) {
    var move = new Move(_.pick(options, 'type'));
    if (!move.isValid()) return cb(400);
    var users = options.game.get('users');
    if (!users.get(options.user)) {
      if (move.get('type') !== 'up') return cb(403);
      users.add(options.user);
    }
    options.user.applyMove(move);
    cb(null, move);
  }
});
