module.exports = function (req, res) {
  var users = req.app.world.users;
  if (!users.get(req.user)) users.add(req.user);
  req.user.moveUp();
  res.send(204);
};
