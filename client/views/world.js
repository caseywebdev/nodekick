(function () {
  'use strict';

  var app = window.app;
  var _ = window._;
  var Backbone = window.Backbone;
  var PIXI = window.PIXI;
  var requestAnimFrame = window.requestAnimFrame;



  app.WorldView = Backbone.View.extend({
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
        character: 'kick',
        state: 'standing',
        x: 0,
        y: 0,
        dir: 1
      });
      var character = new app.Character({user: user});
      this.characters.addChild(character.get('sprite'));
      this.render();
    },

    render: function () {
      this.renderer.render(this.stage);
      requestAnimFrame(_.bind(this.render, this));
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
// <!DOCTYPE HTML>
// <html>
// <head>
//   <title>pixi.js example 2 loading a sprite sheet</title>
//   <style>
//     body {
//       margin: 0;
//       padding: 0;
//       background-color: #000000;
//     }
//   </style>
//   <script src="pixi.js"></script>
// </head>
// <body>
//   <script>

//   // create an array of assets to load
//   var assetsToLoader = [ "SpriteSheet.json"];

//   // create a new loader
//   loader = new PIXI.AssetLoader(assetsToLoader);

//   // use callback
//   loader.onComplete = onAssetsLoaded

//   //begin load
//   loader.load();

//   // holder to store aliens
//   var aliens = [];
//   var alienFrames = ["eggHead.png", "flowerTop.png", "helmlok.png", "skully.png"];

//   var count = 0;

//   // create an new instance of a pixi stage
//   var stage = new PIXI.Stage(0xFFFFFF);

//   // create a renderer instance.
//   renderer = PIXI.autoDetectRenderer(800, 600);

//   // add the renderer view element to the DOM
//   document.body.appendChild(renderer.view);

//   // create an empty container
//   var alienContainer = new PIXI.DisplayObjectContainer();
//   alienContainer.position.x = 400;
//   alienContainer.position.y = 300;

//   stage.addChild(alienContainer);

//   function onAssetsLoaded()
//   {
//     // create a texture from an image path
//     // add a bunch of aliens
//     for (var i = 0; i < 100; i++)
//     {
//       var frameName = alienFrames[i % 4];

//       // create an alien using the frame name..
//       var alien = PIXI.Sprite.fromFrame(frameName);

//       /*
//        * fun fact for the day :)
//        * another way of doing the above would be
//        * var texture = PIXI.Texture.fromFrame(frameName);
//        * var alien = new PIXI.Sprite(texture);
//        */

//       alien.position.x = Math.random() * 800 - 400;
//       alien.position.y = Math.random() * 600 - 300;
//       alien.anchor.x = 0.5;
//       alien.anchor.y = 0.5;
//       aliens.push(alien);
//       alienContainer.addChild(alien);
//     }

//     // start animating
//     requestAnimFrame( animate );


//   }

//   function animate() {

//       requestAnimFrame( animate );

//       // just for fun, lets rotate mr rabbit a little
//       for (var i = 0; i < 100; i++)
//     {
//       var alien = aliens[i];
//       alien.rotation += 0.1;
//     }

//     count += 0.01;
//     alienContainer.scale.x = Math.sin(count)
//     alienContainer.scale.y = Math.sin(count)

//     alienContainer.rotation += 0.01
//       // render the stage
//       renderer.render(stage);
//   }

//   </script>

//   </body>
// </html>
