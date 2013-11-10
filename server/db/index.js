var redis = require('redis');
var client = redis.createClient();
var _ = require('underscore');

client.on('error', console.error.bind(console));

var usersKey = 'nodekick:users';
var scoresKey = 'nodekick:scores';

module.exports = {
  findUser: function (id, cb) {
    client.hget(usersKey, id, function (er, userJSON) {
      if (er) cb(er);
      cb(null, JSON.parse(userJSON));
    });
  },
  createUser: function (user, cb) {
    var userJSON = JSON.stringify(user.toUserData());
    client.hset(usersKey, user.id, userJSON, function (er) {
      if (er) cb(er);
      cb(null, user.id);
    });
  },
  registerKill: function (user, cb) {
    client.zincrby(scoresKey, 1, user.id, function (er, score) {
      console.log(user.get('username') + ' now has ' + score + ' kills');
      if (cb) cb(er, score);
    });
  },
  getScores: function (cb) {
    client.zrevrange(scoresKey, 0, 20, 'WITHSCORES', function (er, scores) {
      if (er) return cb(er);
      var ids = _.filter(scores, function (_, i) { return i % 2 === 0; });
      client.hmget(usersKey, ids, function (er, usersJSON) {
        if (er) return cb(er);
        var users = _.map(usersJSON, JSON.parse.bind(JSON));
        _.each(users, function (user, i) {
          user.score = scores[i * 2 + 1];
        });
        return cb(null, users);
      });
    });
  }
};

process.on('SIGTERM', client.end.bind(client));
