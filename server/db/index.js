var redis = require('redis');
var client = redis.createClient();

client.on('error', console.error.bind(console));

module.exports = {
  findUser: function (sn, cb) {
    client.hget('nk:users', sn, function (err, userJSON) {
      if (err) cb(err);
      cb(null, JSON.parse(userJSON));
    });
  },
  createUser: function (user, cb) {
    client.hset('nk:users', user.sn, JSON.stringify(user), function (err) {
      if (err) cb(err);
      console.log('created user', user);
      cb(null, user.sn);
    });
  }
};

process.on('SIGTERM', client.end.bind(client));
