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
        xv: -(config.kickPower - (Math.random() * config.kickPower)),
        yv: config.kickPower - (Math.random() * config.kickPower),
        rv: Math.random() * Math.PI * 20,
        av: 0.25 + (Math.random() * 0.25)
      };
    },

    initialize: function () {
      var sprite = this.get('sprite');
      sprite.anchor.x = sprite.anchor.y = 0.5;
      this.set('rv', (this.get('xv') < 0 ? -1 : 1) * this.get('rv'));
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
      sprite.alpha -= this.get('av') * dt;
      if (sprite.position.y < 0) return;
      var remainingTime = sprite.position.y / yv;
      yv = -((yv - (remainingTime * config.gravity)) * this.bounce);
      this.set({
        xv: xv * this.bounce,
        yv: yv,
        rv: rv * this.bounce
      });
      sprite.position.y = yv * remainingTime;
    }
  });

  ExplosionPiece.Collection = Model.Collection.extend({
    model: ExplosionPiece
  });
})();
