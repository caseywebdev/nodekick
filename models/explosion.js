//= require ./model

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var Model = app.Model;
  var PIXI = window.PIXI;

  var Explosion = app.Explosion = Model.extend({
    relations: {
      explosionPieces: {hasMany: 'explosion-piece'}
    },

    initialize: function () {
      this.listenTo(this.get('world'), 'step', this.step);
      var sprite = this.get('sprite');
      var texture = sprite.texture;
      var rows = this.get('rows');
      var columns = this.get('columns');
      var explosionPieces = this.get('explosionPieces');
      var container = this.get('container');
      var offsetX = sprite.position.x - (sprite.anchor.x * sprite.width);
      var offsetY = sprite.position.y - (sprite.anchor.y * sprite.height);
      var pieceWidth = sprite.width / columns;
      var pieceHeight = sprite.height / rows;
      var texturePieceWidth = texture.frame.width / columns;
      var texturePieceHeight = texture.frame.height / rows;
      return _.times(rows, function (y) {
        return _.times(columns, function (x) {
          var explosionPieceTexture = new PIXI.Texture(texture.baseTexture, {
            x: texture.frame.x + (x * texturePieceWidth),
            y: texture.frame.y + (y * texturePieceWidth),
            width: texturePieceWidth,
            height: texturePieceHeight
          });
          var explosionPieceSprite = new PIXI.Sprite(explosionPieceTexture);
          explosionPieceSprite.position.x = offsetX + ((x + 0.5) * pieceWidth);
          explosionPieceSprite.position.y = offsetY + ((y + 0.5) * pieceHeight);
          var explosionPiece = new app.ExplosionPiece({
            sprite: explosionPieceSprite
          });
          explosionPieces.add(explosionPiece);
          container.addChildAt(
            explosionPieceSprite,
            _.random(container.children.length)
          );
        }, this);
      }, this);
    },

    step: function (dt) {
      var container = this.get('container');
      var explosionPieces = this.get('explosionPieces');
      var toRemove = [];
      explosionPieces.each(function (explosionPiece) {
        explosionPiece.step(dt);
        var sprite = explosionPiece.get('sprite');
        if (sprite.alpha > 0) return;
        container.removeChild(sprite);
        toRemove.push(explosionPiece);
      });
      explosionPieces.remove(toRemove);
      if (!explosionPieces.length) this.stopListening();
    }
  });

  Explosion.Collection = Model.Collection.extend({
    model: Explosion
  });
})();
