var redis = require('redis');
var client = redis.createClient();

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
  }
};

process.on('SIGTERM', client.end.bind(client));
