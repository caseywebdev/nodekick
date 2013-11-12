//= require ./view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var Backbone = window.Backbone;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;

  app.WorldView = app.View.extend({
    width: 2560,

    height: 1400,

    initialize: function () {
      this.stage = new PIXI.Stage(0xffffff);
      this.renderer = new PIXI.autoDetectRenderer(this.width, this.height);
      this.characters = new PIXI.DisplayObjectContainer();
      this.characters.position.x = this.width / 2;
      this.characters.position.y = this.height / 2;
      this.stage.addChild(this.characters);
      this.$el.append(this.renderer.view);
      var user = window.user = new app.User({
        character: 'dive',
        state: 'standing',
        x: 0,
        y: 0,
        dir: 1
      });
      var character = new app.Character({user: user});
      this.characters.addChild(character.get('sprite'));
      _.bindAll(this, 'render');
      this.render();
    },

    render: function () {
      this.renderer.render(this.stage);
      requestAnimFrame(this.render);
    }
  });

  app.Character = Backbone.Model.extend({
    initialize: function () {
      this.listenTo(this.get('user'), {
        'change:character change:state': this.updateTexture,
        'change:x change:y': this.updatePosition,
        'change:dir': this.updateDirection
      }).createSprite();
    },

    createSprite: function () {
      var sprite = new PIXI.Sprite(this.texture());
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 1;
      this.set('sprite', sprite);
      this.updatePosition();
      this.updateDirection();
    },

    texture: function () {
      var user = this.get('user');
      var character = user.get('character');
      var state = user.get('state');
      return PIXI.TextureCache[character + '-' + state + '.png'];
    },

    updateTexture: function () {
      this.get('sprite').setTexture(this.texture());
    },

    updatePosition: function () {
      _.extend(this.get('sprite').position, this.get('user').pick('x', 'y'));
    },

    updateDirection: function () {
      this.get('sprite').scale.x = this.get('user').get('dir');
    }
  });
})();
