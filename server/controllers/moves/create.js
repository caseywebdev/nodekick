var movesCreate = require('../../../interactions/moves/create');

module.exports = function (req, res, next) {
  movesCreate.run({
    type: req.body.type,
    user: req.user,
    game: req.app.game
  }, function (er, val) { er ? next(er) : res.send(val); });
};
