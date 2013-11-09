if (!window.NodeKick)
  window.NodeKick = {};

(function() {
  
  var Drawer = window.NodeKick.Drawer = {

    init: function() {
      this.canvas = window.document.getElementById('stage');
      this.c = this.canvas.getContext('2d');

      this.c.fillStyle = '#F00';
      this.c.strokeStyle = '#0F0';
    },

    drawBackground: function() {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

    },

    drawUsers: function(users) {
      //console.log('drawing users', this.c.fillStyle);
      this.c.fillRect(0, 0, 100, 100);

      
      _.each(users, function(user) {

        var spriteX = 0;
        this.c.strokeRect(user.x, user.y, 200, 400);
        var spriteX = 0;
        if (user.state == 'jump')
          spriteX = 200;
        else if (user.state == 'kick')
          spriteX = 400;

        this.c.drawImage(window.NodeKick.Assets.diveSprite, spriteX, 0, 200, 400, user.x, user.y, 200, 400);

      }, this);

    }
  };

})();