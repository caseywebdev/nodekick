'use strict';

var _ = require('underscore')._;
var config = require('../config');
var express = require('express');
var fs = require('fs');
var passport = require('passport');

// express setup
require('express-namespace');
var app = module.exports = express();

// Store the base URL for the url normalizer.
app.set('url', config.url);

// All lower case and no trailing slashes allowed.
app.enable('case sensitive routing');
app.enable('strict routing');

// Don't show x-powered-by header for fewers bytes and increased security.
app.disable('x-powered-by');

// Set view engine up for static pages and email.
app.set('views', __dirname + '/../views');
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
app.use(express.static(__dirname + '/../../public'));
app.use(require('../middleware/template-helpers'));
app.use(require('../middleware/url-normalizer'));
app.use(passport.initialize());
app.use(passport.session());

// controllers
var files = _.without(fs.readdirSync(__dirname + '/../controllers'), 'errors');
_.each(files, function (file) {
  if (file[0] === '.') return;
  require('../controllers/' + file)(app);
});
require('../controllers/errors')(app);

app.server = app.listen(config.port);

process.on('SIGTERM', _.bind(app.server.close, app.server));
