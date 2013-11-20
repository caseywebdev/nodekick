//= require ../view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;

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
      this.container.addChild(this.layer1 = new PIXI.DisplayObjectContainer());
      this.container.addChild(this.layer2 = new PIXI.DisplayObjectContainer());
      this.container.position.x = this.width / 2;
      this.container.position.y = this.height - 100;
      this.stage.addChild(this.container);
      this.$el.append(this.renderer.view);
      this.users = this.model.get('users');
      var line = new PIXI.Graphics();
      line.lineStyle(2, 0xFF0000);
      line.moveTo(-(this.width / 2), 0);
      line.lineTo(this.width / 2, 0);
      this.layer1.addChild(line);
      this.createSawblades();
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
          this.layer2.addChildAt(
            sawBlade,
            _.random(this.layer2.children.length)
          );
          return sawBlade;
        }, this);
      }, this));
      this.listenTo(this.model, 'step', function (dt) {
        _.each(sawBlades, function (sawBlade) {
          sawBlade.rotation += sawBlade.scale.x * Math.PI * 10 * dt;
        });
      });
    },

    addCharacter: function (user) {
      var character = new app.Character({user: user});
      this.characters.add(character);
      this.layer2.addChild(character.get('sprite'));
    },

    removeCharacter: function (user) {
      var character = this.characters.findWhere({user: user});
      if (!character) return;
      var sprite = character.get('sprite');
      this.characters.remove(character);
      this.layer2.removeChild(sprite);
      var killForce = user.get('killForce');
      new app.ExplosionPiece.Collection(null, {
        sprite: sprite,
        rows: 20,
        columns: 10,
        game: this.model,
        container: this.layer2,
        xv: user.get('xv') + ((killForce && killForce.xv) || 0),
        yv: -(user.get('yv') + ((killForce && killForce.yv) || 0))
      });
    }
  });
})();
