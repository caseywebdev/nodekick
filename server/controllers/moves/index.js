module.exports = function (app) {
  app.namespace('/move', function () {
    // Signed in necessary.
    var auth = require('../auth/validate');

    // app.post('/left', auth);
    // app.post('/right', auth, right);
    // app.post('/up', auth, up);
  });
};
