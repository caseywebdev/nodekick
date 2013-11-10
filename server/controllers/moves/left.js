module.exports = function (req, res) {
  if (req.app.world.users.get(req.user)) req.user.moveLeft();
  res.send(204);
};
