module.exports = function (app) {
  app.namespace('/move', function () {
    // Signed in necessary.
    var auth = require('../auth/authorize');

    app.post('/left', auth, function (req, res) {
      res.end(200);
    });
    // app.post('/right', auth, right);
    // app.post('/up', auth, up);
  });
};
