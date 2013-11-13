//= require ./model

(function () {
  'use strict';

  var app = window.app;

  var config = app.config;
  var Model = app.Model;

  var ExplosionPiece = app.ExplosionPiece = Model.extend({
    bounce: 0.5,

    defaults: function () {
      return {
        xv: 50 - (Math.random() * 100),
        yv: 50 - (Math.random() * 100),
        rv: 0.1 - (Math.random() * 0.2)
      };
    },

    initialize: function () {
      var sprite = this.get('sprite');
      sprite.anchor.x = sprite.anchor.y = 0.5;
    },

    step: function (dt) {
      var sprite = this.get('sprite');
      var xv = this.get('xv');
      var yv = this.get('yv') + config.gravity * dt;
      this.set('yv', yv);
      var rv = this.get('rv');
      sprite.position.x += xv * dt;
      sprite.position.y += yv * dt;
      sprite.rotation += rv * dt;
      if (sprite.y < 0) return;
      sprite.y = 0;
      this.set({
        xv: xv * this.bounce,
        yv: -(yv * this.bounce),
        rv: rv * this.bounce
      });
    }
  });

  ExplosionPiece.Collection = Model.Collection.extend({
    model: ExplosionPiece
  });
})();
