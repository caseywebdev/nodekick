require('backbone-relations');
var config = require('./config');
var express = require('express');
var fs = require('fs');
var _ = require('underscore')._;
var World = require('../models/world');
var User = require('../models/user');
var ws = require('ws');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var db = require('./db');

// express setup
require('express-namespace');
var app = module.exports = express();
var server = app.listen(config.port);

// start socket.io
app.wss = new ws.Server({server: server});

// Store the base URL for the url normalizer.
app.set('url', config.url);

// All lower case and no trailing slashes allowed.
app.enable('case sensitive routing');
app.enable('strict routing');

// Don't show x-powered-by header for fewers bytes and increased security.
app.disable('x-powered-by');

// Set view engine up for static pages and email.
app.set('views', __dirname + '/views');
app.set('view engine', 'tmpl');
require('underscore-express')(app);

// Middleware
app.use(express.compress());
app.use(express.urlencoded());
app.use(express.json());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession(config.session));
app.use(express.csrf());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../public'));
app.use(require('./middleware/template-helpers'));
app.use(require('./middleware/url-normalizer'));

// passport setup
// will replace this with redis

passport.use(new TwitterStrategy(config.twitter,
  function (token, tokenSecret, profile, done) {
    var users = app.world.get('users');
    var user = users.get(profile.id);
    done(null, user || new User({
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos[0].value
    }));
  }
));

passport.serializeUser(function (user, done) {
  db.createUser(user, function (er) { done(er, user.id); });
});

passport.deserializeUser(function (id, done) {
  var users = app.world.get('users');
  var user = users.get(id);
  if (user) return done(null, user);
  db.findUser(id, function (er, user) {
    if (er) return done(er);
    done(null, new User(user));
  });
});

// add game state, app.world
app.world = new World();

// controllers
var files = _.without(fs.readdirSync(__dirname + '/controllers'), 'errors');
_.each(files, function (file) {
  if (file[0] === '.') return;
  require('./controllers/' + file)(app);
});
require('./controllers/errors')(app);

// signal hooks
process.on('SIGTERM', function () {
  app.world.stop();
  server.close();
});
