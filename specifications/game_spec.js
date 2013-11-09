var _ = require('underscore');
var User = require('../server/models/user.js');
var World = require('../server/models/world.js');

describe('game stuff', function() {
  it('user added to world', function() {
    var world = new World();
    var user = new User();
    world.users.add(user);
    user.moveUp();
    console.log(user.attributes);
    world.step();
    console.log(user.attributes);
  });
});
