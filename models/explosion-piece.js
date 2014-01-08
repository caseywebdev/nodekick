//= require ./model.js

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var config = app.config;
  var Model = app.Model;
  var PIXI = window.PIXI;

  var ExplosionPiece = app.ExplosionPiece = Model.extend({
    bounce: 0.5,

    defaults: function () {
      return {
        xv: 1000 - (Math.random() * 2000),
        yv: 1000 - (Math.random() * 2000),
        rv: Math.random() * Math.PI * 10,
        fv: 0.25 + (Math.random() * 0.25)
      };
    },

    initialize: function () {
      var sprite = this.get('sprite');
      sprite.anchor.x = sprite.anchor.y = 0.5;
      this.set('xv', this.get('xv') + 1000 - (Math.random() * 2000));
      this.set('yv', this.get('yv') + 1000 - (Math.random() * 2000));
      this.set('av', (this.get('xv') < 0 ? -1 : 1) * this.get('rv'));
    },

    step: function (dt) {
      var sprite = this.get('sprite');
      var xv = this.get('xv');
      var yv = this.get('yv') + config.game.gravity * dt;
      this.set('yv', yv);
      var av = this.get('av');
      sprite.position.x += xv * dt;
      sprite.position.y += yv * dt;
      sprite.rotation += av * dt;
      sprite.alpha -= this.get('fv') * dt;
      if (sprite.position.y < 0) return;
      var remainingTime = sprite.position.y / yv;
      yv = -((yv - (remainingTime * config.game.gravity)) * this.bounce);
      this.set({xv: xv * this.bounce, yv: yv, av: av * this.bounce});
      sprite.position.y = yv * remainingTime;
    }
  });

  ExplosionPiece.Collection = Model.Collection.extend({
    model: ExplosionPiece,

    initialize: function (__, options) {
      this.listenTo(options.game, 'step', this.step);
      var sprite = options.sprite;
      var texture = sprite.texture;
      var rows = options.rows;
      var columns = options.columns;
      var container = this.container = options.container;
      var scaleX = sprite.scale.x;
      var scaleY = sprite.scale.y;
      var offsetX = sprite.position.x - (sprite.anchor.x * sprite.width);
      var offsetY = sprite.position.y - (sprite.anchor.y * sprite.height);
      var pieceWidth = sprite.width / columns;
      var pieceHeight = sprite.height / rows;
      var texturePieceWidth = texture.frame.width / columns;
      var texturePieceHeight = texture.frame.height / rows;
      var xv = options.xv;
      var yv = options.yv;
      return _.times(rows, function (y) {
        return _.times(columns, function (x) {
          var explosionPieceTexture = new PIXI.Texture(texture.baseTexture, {
            x: texture.frame.x + (x * texturePieceWidth),
            y: texture.frame.y + (y * texturePieceWidth),
            width: texturePieceWidth,
            height: texturePieceHeight
          });
          var explosionPieceSprite = new PIXI.Sprite(explosionPieceTexture);
          explosionPieceSprite.scale.x = scaleX;
          explosionPieceSprite.scale.y = scaleY;
          explosionPieceSprite.position.x = offsetX + ((x + 0.5) * pieceWidth);
          explosionPieceSprite.position.y = offsetY + ((y + 0.5) * pieceHeight);
          var explosionPiece = new app.ExplosionPiece({
            sprite: explosionPieceSprite,
            xv: xv,
            yv: yv
          });
          this.add(explosionPiece);
          container.addChildAt(
            explosionPieceSprite,
            _.random(container.children.length)
          );
        }, this);
      }, this);
    },

    step: function (dt) {
      var container = this.container;
      var toRemove = [];
      this.each(function (explosionPiece) {
        explosionPiece.step(dt);
        var sprite = explosionPiece.get('sprite');
        if (sprite.alpha > 0) return;
        container.removeChild(sprite);
        toRemove.push(explosionPiece);
      });
      this.remove(toRemove);
      if (!this.length) this.stopListening();
    }
  });
})();
