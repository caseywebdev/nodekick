module.exports = function (req, res) {
  req.user.moveLeft();
  res.send(204);
};
