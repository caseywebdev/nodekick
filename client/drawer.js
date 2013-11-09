if (!window.NodeKick)
  window.NodeKick = {};

(function() {
  
  var Drawer = window.NodeKick.Drawer = {

    floorY: 590,
    spriteHeight: 200,
    spriteWidth: 100,
    spriteBottomPadding: 15,

    drawServerOrigin: false,
    drawBoundingBox: false,
    drawFloorLine: false,

    init: function() {
      this.canvas = window.document.getElementById('stage');
      this.c = this.canvas.getContext('2d');

      this.c.fillStyle = '#F00';
      this.c.strokeStyle = '#0F0';
    },

    drawBackground: function() {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.drawFloorLine) {
        this.c.beginPath();
        this.c.moveTo(0, this.floorY);
        this.c.lineTo(this.canvas.width, this.floorY);
        this.c.stroke();
      }
    },

    drawUsers: function(users) {

      
      _.each(users, function(user) {

        var x = user.x - (this.spriteWidth / 2);
        var y = this.floorY + user.y - this.spriteHeight + this.spriteBottomPadding;
        var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };

        if (this.drawBoundingBox)
          this.c.strokeRect(x, y, 100, 200);
        if (this.drawServerOrigin)
          this.c.fillRect(serverOrigin.x, serverOrigin.y, 5, 5);

        if (user.dir === 1) {
          var spriteX = 0;
          if (user.state == 'jumping')
            spriteX = 200;
          else if (user.state == 'kicking')
            spriteX = 400;
          this.c.drawImage(window.NodeKick.Assets.diveSprite, spriteX, 0, 200, 400, x, y, 100, 200);
        }
        else {
          var spriteX = 0;
          if (user.state == 'jumping')
            spriteX = 200;
          else if (user.state == 'standing')
            spriteX = 400;
          //console.log('spriteX', spriteX);
          this.c.drawImage(window.NodeKick.Assets.diveSpriteInverted, spriteX, 0, 200, 400, x, y, 100, 200);
        }



      }, this);

    }
  };

})();