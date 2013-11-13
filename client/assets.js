(function () {

  var _ = window._;
  var SPRITES = ['donatello', 'dive', 'redacted'];
  var BACKGROUNDS = ['background-daytime.png',
    'background-daytime-distant.png',
    'background-nighttime-distant.png',
    'background-nighttime.png',
    'cloud-sprite.png'];

  var Assets = window.app.Assets = {
    availableSprites: ['donatello', 'dive', 'redacted'],
    sprites: {},
    backgroundImages: {},
    isLoaded: function () {
      if (_.isEmpty(this.sprites)) return false;
      return _(this.sprites).pluck('isLoaded').every(_.identity) && _(this.backgroundImages).pluck('isLoaded').every(_.identity);
    },
    getSprite: function (user) {
      return _.values(this.sprites)[user.id % 3];
    },
    init: function () {
      _.each(this.availableSprites, function (spriteName) {
        var sprite = this.sprites[spriteName] = new Image();
        sprite.addEventListener('load', function () {
          // create inverted copy
          var invertedEl = sprite.inverted = document.getElementById(spriteName + '-invert');
          var c = invertedEl.getContext('2d');
          c.scale(-1, 1);
          c.drawImage(sprite, -invertedEl.width, 0, invertedEl.width, invertedEl.height);
          sprite.isLoaded = true;
        });
        sprite.src = '/images/' + spriteName + '-sprite.png';
      }, this);

      _.each(BACKGROUNDS, function(backgroundImageName) {
        var image = this.backgroundImages[backgroundImageName] = new Image();
        image.addEventListener('load', function() {
          image.isLoaded = true;
        })
        image.src = '/images/' + backgroundImageName;

      }, this);

    },
  };
})();
