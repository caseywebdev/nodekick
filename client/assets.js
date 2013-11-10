(function () {
  if (!window.NodeKick) window.NodeKick = {};

  var _ = window._;

  var Assets = window.NodeKick.Assets = {
    availableSprites: ['donatello', 'dive', 'redacted'],
    sprites: {},
    isLoaded: function () {
      if (_.isEmpty(this.sprites)) return false;
      return _(this.sprites).pluck('isLoaded').every(_.identity);
    },
    getSprite: function (user) {
      return _.values(this.sprites)[~~user.id % 3];
    },
    init: function () {
      _.each(this.availableSprites, function (spriteName) {
        var sprite = this.sprites[spriteName] = new Image();
        sprite.addEventListener('load', function () {
          console.log('sprite loaded: ' + spriteName, sprite);
          // create inverted copy
          var invertedEl = sprite.inverted = document.getElementById(spriteName + '-invert');
          var c = invertedEl.getContext('2d');
          c.scale(-1, 1);
          c.drawImage(sprite, -invertedEl.width, 0, invertedEl.width, invertedEl.height);
          sprite.isLoaded = true;
        });
        sprite.src = '/images/' + spriteName + '-sprite.png';
      }, this);
    },
  };
})();
