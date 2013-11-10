var _ = require('underscore');
var User = require('../server/models/user.js');
var World = require('../server/models/world.js');

describe('game stuff', function() {
  it('user jumps', function() {
    var world = new World();
    world.lastStep = Date.now();

    var user = new User();
    world.users.add(user);
    user.set({ y: 0, state: "standing" });

    user.moveUp();
    expect(user.attributes.y).toEqual(0);

    world.step();
    expect(user.attributes.y < 0).toEqual(true);
  });

  it('user kicking kills', function() {
    var world = new World();
    world.lastStep = Date.now();

    var standingUser = new User();
    standingUser.set({ x: 300, y: 0, state: "standing" });
    standingUser.set({ streak: 10 });
    world.users.add(standingUser);

    var standingUser2 = new User();
    standingUser2.set({ x: 600, y: 0, state: "standing" });
    world.users.add(standingUser2);

    var kickingUser = new User();
    kickingUser.set({ x: 340, y: -73, dir: -1 });
    kickingUser.moveLeft();
    world.users.add(kickingUser);

    world.step();
    expect(standingUser.isDead()).toBe(true);
    expect(standingUser2.isDead()).toBe(false);
    expect(kickingUser.get("streak")).toBe(1);
    expect(standingUser.get("streak")).toBe(0);
  });
});
