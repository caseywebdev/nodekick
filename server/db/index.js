var redis = require('redis');
var client = redis.createClient();

client.on('error', console.error.bind(console));

module.exports = {
  findUser: function (id, cb) {
    client.hget('nodekick:users', id, function (er, userJSON) {
      if (er) cb(er);
      cb(null, JSON.parse(userJSON));
    });
  },
  createUser: function (user, cb) {
    client.hset('nodekick:users', user.id, JSON.stringify(user), function (er) {
      if (er) cb(er);
      console.log('created user', user);
      cb(null, user.id);
    });
  }
};

process.on('SIGTERM', client.end.bind(client));
