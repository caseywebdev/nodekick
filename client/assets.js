if (!window.NodeKick)
  window.NodeKick = {};

(function() {
  
  var Assets = window.NodeKick.Assets = {

    imageAssetCount: 0,

    init: function() {
      console.log('calling init');
      this.isLoaded = false;
      var self = this;

      this.diveSprite = new Image();
      this.diveSprite.addEventListener('load', function (evt) { self.imageLoaded.call(self) });
      this.diveSprite.src = 'images/kick-sprite.png';

      this.donatelloSprite = new Image();
      this.donatelloSprite.addEventListener('load', function (evt) { self.imageLoaded.call(self) });
      this.donatelloSprite.src = 'images/donatello-sprite.png';

      console.log('bong');
    },

    imageLoaded: function() {
      console.log('image loaded');

      this.imageAssetCount++;

      if (this.imageAssetCount === 2)
        this.isLoaded = true;

    },

  };

})();