//= require ../view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;
  var PI2 = Math.PI * 2;

  app.GamesShowView = app.View.extend({
    width: app.config.game.width,

    height: app.config.game.height,

    listeners: {
      users: {add: 'addCharacter', 'remove change:isDead': 'removeCharacter'}
    },

    initialize: function () {
      this.stage = new PIXI.Stage(0xffffff);
      this.renderer = new PIXI.autoDetectRenderer(this.width, this.height);
      this.characters = new app.Character.Collection();
      this.container = new PIXI.DisplayObjectContainer();
      this.container.addChild(
        this.backgroundLayer = new PIXI.DisplayObjectContainer()
      );
      this.container.addChild(
        this.tagLayer = new PIXI.DisplayObjectContainer()
      );
      this.container.addChild(
        this.playerLayer = new PIXI.DisplayObjectContainer()
      );
      this.container.position.x = this.width / 2;
      this.container.position.y = this.height - 100;
      this.stage.addChild(this.container);
      this.$el.append(this.renderer.view);
      this.users = this.model.get('users');
      var line = new PIXI.Graphics();
      line.lineStyle(2, 0xFF0000);
      line.moveTo(-(this.width / 2), 0);
      line.lineTo(this.width / 2, 0);
      this.backgroundLayer.addChild(line);
      this.createSawblades();
      _.each(this.users.where({isDead: false}), this.addCharacter, this);
      _.bindAll(this, 'render');
      this.render();
    },

    render: function () {
      this.renderer.render(this.stage);
      requestAnimFrame(this.render);
    },

    createSawblades: function () {
      var sawBlades = _.flatten(_.map([-1, 1], function (dir) {
        return _.times(30, function (y) {
          var sawBlade = new PIXI.Sprite(PIXI.TextureCache['saw-blade.png']);
          sawBlade.anchor.x = sawBlade.anchor.y = 0.5;
          sawBlade.position.x = dir * (app.config.game.width / 2);
          sawBlade.position.y = -((0.5 + y) * (sawBlade.height / 2));
          sawBlade.scale.x = dir;
          sawBlade.rotation = PI2 * Math.random();
          this.playerLayer.addChildAt(
            sawBlade,
            _.random(this.playerLayer.children.length)
          );
          return sawBlade;
        }, this);
      }, this));
      this.listenTo(this.model, 'step', function (dt) {
        _.each(sawBlades, function (sawBlade) {
          sawBlade.rotation =
            (sawBlade.rotation + sawBlade.scale.x * PI2 * 5 * dt) % PI2;
        });
      });
    },

    addCharacter: function (user) {
      var character = new app.Character({user: user});
      this.characters.add(character);
      this.playerLayer.addChild(character.get('sprite'));
      this.tagLayer.addChild(character.get('tag'));
    },

    removeCharacter: function (user) {
      var character = this.characters.findWhere({user: user});
      if (!character) return;
      var sprite = character.get('sprite');
      this.characters.remove(character);
      this.playerLayer.removeChild(sprite);
      this.tagLayer.removeChild(character.get('tag'));
      var killForce = user.get('killForce');
      new app.ExplosionPiece.Collection(null, {
        sprite: sprite,
        rows: 20,
        columns: 10,
        game: this.model,
        container: this.playerLayer,
        xv: (killForce && killForce.xv) || 0,
        yv: (killForce && -killForce.yv) || 0
      });
    }
  });
})();
