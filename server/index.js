// record check-ins
require('nko')('15Mr9rFk1qr71_mD');

var config = require('./config');
var express = require('express');
var fs = require('fs');
var _ = require('underscore')._;

// express setup
require('express-namespace');
var app = module.exports = express();
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.cookieSession(config.session));
app.use(express.static('public'));

// controllers
var files = fs.readdirSync(__dirname + '/controllers');
var controllers = _.without(files);
_.each(controllers, function (controller) {
  if (controller[0] === '.') return;
  require('./controllers/' + controller)(app);
});

// system settings

// if run as root, downgrade to the owner of this file
if (process.getuid() === 0) {
  require('fs').stat(__filename, function (err, stats) {
    if (err) { return console.error(err); }
    process.setuid(stats.uid);
  });
}

// start game
var server = app.listen(config.port);

// signal hooks
process.on('SIGTERM', _.bind(server.close, server));