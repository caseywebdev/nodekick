module.exports = function (app) {
  app.post('/moves', require('../sessions/authorize'), require('./create'));
};
