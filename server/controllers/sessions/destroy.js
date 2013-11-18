'use strict';

module.exports = function (req, res) {
  req.logout();
  res.send(204);
};
