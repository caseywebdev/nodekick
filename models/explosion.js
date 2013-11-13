//= require ./model

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var Model = app.Model;
  var PIXI = window.PIXI;

  var Explosion = app.Explosion = Model.extend({
    relations: {
      explosionPieces: {hasMany: 'ExplosionPiece'}
    },

    initialize: function () {
      var sprite = this.get('sprite');
      var texture = sprite.texture;
      var rows = this.get('rows');
      var columns = this.get('columns');
      var explosionPieces = this.get('explosionPieces');
      var container = this.get('container');
      var offsetX = sprite.position.x + (sprite.anchor.x * sprite.width);
      var offsetY = sprite.position.y + (sprite.anchor.y * sprite.height);
      var pieceWidth = sprite.width / columns;
      var pieceHeight = sprite.height / rows;
      return _.times(rows, function (y) {
        return _.times(columns, function (x) {
          var explosionPieceTexture = new PIXI.Texture(texture.baseTexture, {
            x: texture.frame.x + (x * pieceWidth),
            y: texture.frame.y + (y * pieceHeight),
            width: pieceWidth,
            height: pieceHeight
          });
          var explosionPieceSprite = new PIXI.Sprite(explosionPieceTexture);
          explosionPieceSprite.position.x = offsetX + ((x + 0.5) * pieceWidth);
          explosionPieceSprite.position.y = offsetY + ((x + 0.5) * pieceHeight);
          var explosionPiece = new app.ExplosionPiece({
            sprite: explosionPieceSprite
          });
          explosionPieces.add(explosionPiece);
          container.add(explosionPiece.get('sprite'));
        }, this);
      }, this);
    },

    step: function (dt) { this.get('pieces').invoke('step', dt); }
  });

  Explosion.Collection = Model.Collection.extend({
    model: Explosion
  });
})();
