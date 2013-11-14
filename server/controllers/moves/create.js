var movesCreate = require('../../../interactions/moves/create');

module.exports = function (req, res, next) {
  movesCreate.run({
    type: req.body.type,
    user: req.user,
    world: req.app.world
  }, function (er, val) { er ? next(er) : res.send(val); });
};
