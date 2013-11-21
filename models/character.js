//= require ./model

(function () {
  'use strict';

  var app = window.app;

  var Model = app.Model;
  var PIXI = window.PIXI;

  var Character = app.Character = Model.extend({
    initialize: function () {
      this.createSpriteAndTag();
      this.listenTo(this.get('user'), {
        'change:character change:state': this.updateTexture,
        'change:x change:y': this.updatePosition,
        'change:dir': this.updateDirection
      });
    },

    createSpriteAndTag: function () {
      var sprite = new PIXI.Sprite(this.texture());
      sprite.anchor.x = 0.5;
      sprite.anchor.y = 0.9;
      var tag = new PIXI.DisplayObjectContainer();
      var avatar = new PIXI.Sprite(
        PIXI.Texture.fromImage(this.get('user').avatar())
      );
      avatar.width = avatar.height = 48;
      var username = new PIXI.Text(this.get('user').get('username'), {
        font: "30px 'Helvetica Neue'"
      });
      avatar.anchor.y = username.anchor.y = 0.5;
      avatar.position.x = -(avatar.width + username.width + 10) / 2;
      username.position.x = avatar.position.x + avatar.width + 10;
      tag.addChild(avatar);
      tag.addChild(username);
      this.set({sprite: sprite, tag: tag, avatar: avatar, username: username});
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
      var sprite = this.get('sprite');
      var tag = this.get('tag');
      var user = this.get('user');
      sprite.position.x = tag.position.x = user.get('x');
      sprite.position.y = -user.get('y');
      tag.position.y = sprite.position.y - sprite.height;
    },

    updateDirection: function () {
      this.get('sprite').scale.x = this.get('user').get('dir');
    }
  });

  Character.Collection = Model.Collection.extend({
    model: Character
  });
})();
