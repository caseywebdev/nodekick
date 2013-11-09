module.exports = function (req, res) {
  req.user.moveRight();
  res.send(204);
};
