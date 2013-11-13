//= require ./model

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var Model = app.Model;
  var PIXI = window.PIXI;

  var Character = app.Character = Model.extend({
    initialize: function () {
      this.createSprite();
      this.listenTo(this.get('user'), {
        'change:character change:state': this.updateTexture,
        'change:x change:y': this.updatePosition,
        'change:dir': this.updateDirection
      });
    },

    createSprite: function () {
      var sprite = new PIXI.Sprite(this.texture());
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.9;
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

  Character.Collection = Model.Collection.extend({
    model: Character
  });
})();
