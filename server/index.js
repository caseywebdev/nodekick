// record check-ins
require('nko')('15Mr9rFk1qr71_mD');

var config = require('./config');
var express = require('express');
var fs = require('fs');
var _ = require('underscore')._;
var World = require('./models/world');
var User = require('./models/user');
var io = require('socket.io');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var db = require('./db');

// express setup
require('express-namespace');
var app = module.exports = express();
var server = app.listen(config.port);

// start socket.io
app.io = io.listen(server);
app.io.set('log level', 1);
app.io.set('transports', ['websocket', 'flashsocket']);
app.io.set('flash policy port', -1);
app.io.enable('browser client minification');
app.io.enable('browser client etag');
app.io.enable('browser client gzip');

// Set view engine up for static pages and email.
app.set('view engine', 'tmpl');
require('underscore-express')(app);

// Middleware
app.use(express.compress());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.cookieParser());
app.use(express.cookieSession(config.session));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../public'));
app.use(require('./middleware/template-helpers'));

// passport setup
// will replace this with redis

passport.use(new TwitterStrategy(config.twitter,
  function (token, tokenSecret, profile, done) {
    // if (err) { return done(err); }
    console.log(token, profile, done);
    var users = app.world.users;
    users.add({
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos[0].value
    }, {merge: true});
    done(null, users.get(profile.id));
  }
));

passport.serializeUser(function (user, done) {
  db.createUser(user, function (er) { done(er, user.id); });
});

passport.deserializeUser(function (id, done) {
  var users = app.world.users;
  var user = users.get(id);
  if (user) return done(null, user);
  db.findUser(id, function (er, user) {
    if (er) return done(er);
    users.add(user);
    done(null, users.get(user));
  });
});

// add game state, app.world
app.world = new World();
app.world.start();

// controllers
var files = fs.readdirSync(__dirname + '/controllers');
_.each(files, function (file) {
  if (file[0] === '.') return;
  require('./controllers/' + file)(app);
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
