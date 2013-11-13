//= require ../view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;

  app.WorldsShowView = app.View.extend({
    width: 2560,

    height: 1400,

    listeners: {
      users: {add: 'onUserAdd', remove: 'onUserRemove'}
    },

    initialize: function () {
      this.stage = new PIXI.Stage(0xffffff);
      this.renderer = new PIXI.autoDetectRenderer(this.width, this.height);
      this.characters = new app.Character.Collection();
      this.explosions = new app.Explosion.Collection();
      this.container = new PIXI.DisplayObjectContainer();
      this.container.position.x = this.width / 2;
      this.container.position.y = this.height / 2;
      this.stage.addChild(this.container);
      this.$el.append(this.renderer.view);
      this.users = this.model.get('users');
      var line = new PIXI.Graphics();
      line.lineStyle(2, 0xFF0000);
      line.moveTo(-600, 0);
      line.lineTo(600, 0);
      this.container.addChild(line);
      _.bindAll(this, 'render');
      this.render();
    },

    render: function () {
      this.renderer.render(this.stage);
      requestAnimFrame(this.render);
    },

    onUserAdd: function (user) {
      var character = new app.Character({user: user});
      this.characters.add(character);
      this.container.addChild(character.get('sprite'));
    },

    onUserRemove: function (user) {
      var character = this.characters.findWhere({user: user});
      var sprite = character.get('sprite');
      this.characters.remove(character);
      this.container.removeChild(sprite);
      new app.Explosion({
        sprite: sprite,
        rows: 20,
        columns: 10,
        world: this.model,
        container: this.container
      });
    }
  });
})();
