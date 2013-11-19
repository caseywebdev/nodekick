'use strict';

var config = require('../config');
var passport = require('passport');
var passportTwitter = require('passport-twitter');
var User = require('../../models/user');

passport.use(new passportTwitter.Strategy({
  consumerKey: config.passport.twitter.consumerKey,
  consumerSecret: config.passport.twitter.consumerSecret,
  callbackURL: config.url + '/auth/twitter/callback'
}, function (token, tokenSecret, profile, done) {
    done(null, new User({
      id: 'twitter-' + profile.id,
      username: profile.username,
      displayName: profile.displayName,
      avatar: profile.photos[0].value
    }));
  }
));

passport.serializeUser(function (user, done) {
  user.save(null, {cb: function (er) { done(er, user.id); }});
});

passport.deserializeUser(function (id, done) {
  (new User({id: id})).fetch({cb: done});
});
