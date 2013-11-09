// record check-ins
require('nko')('15Mr9rFk1qr71_mD');

var config = require('./config');
var express = require('express');
var fs = require('fs');
var _ = require('underscore')._;
var World = require('./models/world');
var io = require('socket.io');

// express setup
require('express-namespace');
var app = module.exports = express();
var server = app.listen(config.port);

// start socket.io
app.io = io.listen(server);
app.io.set('log level', 0);
app.use(express.compress());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.cookieSession(config.session));
app.use(express.static('public'));

// add game state, app.world
app.world = new World();
app.world.start();

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

// signal hooks
process.on('SIGTERM', function () {
  console.log('received SIGTERM');
  app.world.stop();
  server.close();
  setTimeout(process.exit.bind(process.exit), 100);
});
