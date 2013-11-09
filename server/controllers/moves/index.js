module.exports = function (app) {
  app.namespace('/move', function () {
    // Signed in necessary.
    var auth = require('../auth/validate');

    app.post('/left', auth, require('./left'));
    app.post('/right', auth, require('./right'));
    app.post('/up', auth, require('./up'));
  });
};
