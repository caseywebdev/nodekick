//= require ../view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;

  app.WorldsShowView = app.View.extend({
    width: 2880,

    height: 1620,

    listeners: {
      users: {add: 'addCharacter', 'remove change:isDead': 'removeCharacter'}
    },

    initialize: function () {
      this.stage = new PIXI.Stage(0xffffff);
      this.renderer = new PIXI.autoDetectRenderer(this.width, this.height);
      this.characters = new app.Character.Collection();
      this.explosions = new app.Explosion.Collection();
      this.container = new PIXI.DisplayObjectContainer();
      this.container.addChild(this.layer1 = new PIXI.DisplayObjectContainer());
      this.container.addChild(this.layer2 = new PIXI.DisplayObjectContainer());
      this.container.position.x = this.width / 2;
      this.container.position.y = this.height / 2;
      this.stage.addChild(this.container);
      this.$el.append(this.renderer.view);
      this.users = this.model.get('users');
      var line = new PIXI.Graphics();
      line.lineStyle(2, 0xFF0000);
      line.moveTo(-600, 0);
      line.lineTo(600, 0);
      this.layer1.addChild(line);
      _.bindAll(this, 'render');
      this.render();
    },

    render: function () {
      this.renderer.render(this.stage);
      requestAnimFrame(this.render);
    },

    addCharacter: function (user) {
      var character = new app.Character({user: user});
      this.characters.add(character);
      this.layer2.addChild(character.get('sprite'));
    },

    removeCharacter: function (user) {
      var character = this.characters.findWhere({user: user});
      if (!character) return;
      var sprite = character.get('sprite');
      this.characters.remove(character);
      this.layer2.removeChild(sprite);
      var killForce = user.get('killForce');
      new app.Explosion({
        sprite: sprite,
        rows: 20,
        columns: 10,
        world: this.model,
        container: this.layer2,
        xv: killForce && killForce.xv,
        yv: killForce && -killForce.yv
      });
    }
  });
})();
