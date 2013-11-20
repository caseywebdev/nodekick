var _ = require('underscore');
var Move = require('../../models/move');
var Interaction = require('interaction');

module.exports = new Interaction({
  run: function (options, cb) {
    var move = new Move(_.pick(options, 'type'));
    if (!move.isValid()) return cb(400);
    var user = options.game.get('users').get(options.user);
    if (!user) {
      if (move.get('type') !== 'up') return cb(403);
      user = options.game.spawn(options.user);
    }
    user.applyMove(move);
    cb(null, move);
  }
});
