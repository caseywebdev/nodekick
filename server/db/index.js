var redis = require('redis');
var client = redis.createClient();

client.on('error', console.error.bind(console));

var hkey = 'nodekick:users';

module.exports = {
  findUser: function (id, cb) {
    client.hget(hkey, id, function (er, userJSON) {
      if (er) cb(er);
      cb(null, JSON.parse(userJSON));
    });
  },
  createUser: function (user, cb) {
    client.hset(hkey, user.id, JSON.stringify(user.toUserData()), function (er) {
      if (er) cb(er);
      cb(null, user.id);
    });
  }
};

process.on('SIGTERM', client.end.bind(client));
