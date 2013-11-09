var _ = require('underscore');
var User = require('../server/models/user.js');
var World = require('../server/models/world.js');

describe('game stuff', function() {
  it('user jumps', function() {
    var world = new World();
    world.lastStep = Date.now();

    var user = new User();
    world.users.add(user);

    user.moveUp();
    expect(user.attributes.y).toEqual(0);

    world.step();
    expect(user.attributes.y < 0).toEqual(true);
  });

  it('user kills another user', function() {

  });
});
