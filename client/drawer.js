if (!window.NodeKick)
  window.NodeKick = {};

(function() {
  
  var Drawer = window.NodeKick.Drawer = {

    floorY: 700,
    spriteHeight: 200,
    spriteWidth: 100,
    spriteBottomPadding: 15,

    init: function() {
      this.canvas = window.document.getElementById('stage');
      this.c = this.canvas.getContext('2d');

      this.c.fillStyle = '#F00';
      this.c.strokeStyle = '#0F0';
    },

    drawBackground: function() {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.c.beginPath();
      this.c.moveTo(0, this.floorY);
      this.c.lineTo(this.canvas.width, this.floorY);
      this.c.stroke();
    },

    drawUsers: function(users) {

      
      _.each(users, function(user) {

        var x = user.x;
        var y = this.floorY + user.y - this.spriteHeight + this.spriteBottomPadding;

        //console.log('x, y', x, y);

        var spriteX = 0;
        this.c.strokeRect(x, y, 100, 200);
        var spriteX = 0;
        if (user.state == 'jump')
          spriteX = 200;
        else if (user.state == 'kick')
          spriteX = 400;

        this.c.drawImage(window.NodeKick.Assets.diveSprite, spriteX, 0, 200, 400, x, y, 100, 200);

      }, this);

    }
  };

})();