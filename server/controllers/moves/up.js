module.exports = function (req, res) {
  req.user.moveUp();
  res.send(204);
};
