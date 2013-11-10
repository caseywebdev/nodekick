if (!window.NodeKick)
  window.NodeKick = {};

(function () {
  var _ = window._;

  window.NodeKick.Drawer = {

    floorY: 590,
    spriteHeight: 200,
    spriteWidth: 100,
    spriteBottomPadding: 15,

    drawServerOrigin: false,
    drawBoundingBox: false,
    drawFloorLine: false,

    avatars: {},
    avatarSize: 30,

    init: function () {
      this.canvas = window.document.getElementById('stage');
      this.c = this.canvas.getContext('2d');

      this.c.fillStyle = '#F00';
      this.c.strokeStyle = '#0F0';
    },

    drawBackground: function () {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

      if (this.drawFloorLine) {
        this.c.beginPath();
        this.c.moveTo(0, this.floorY);
        this.c.lineTo(this.canvas.width, this.floorY);
        this.c.stroke();
      }
    },

    drawAvatar: function (user, x, y) {
      var userData = window.app.usersById[user.id];
      var avatar = this.avatars[user.id];
      if (!avatar) {
        avatar = this.avatars[user.id] = new Image();
        avatar.onload = function () {
          avatar.loaded = true;
        };
        avatar.src = userData.avatar;
      }
      if (avatar.loaded) {
        x = x - this.avatarSize / 2;
        y = y - this.avatarSize / 2;
        this.c.drawImage(avatar, x, y, this.avatarSize, this.avatarSize);
      }
    },

    deathImage: function(sprite, spriteX, x, y, deathCooldown) {
      var deathCanvas = window.document.getElementById('deathCanvas');
      var c = deathCanvas.getContext('2d');
      c.clearRect(0, 0, 100, 200);
      c.drawImage(sprite, spriteX, 0, 200, 400, 0, 0, 100, 200);
      var image = c.getImageData(0, 0, 100, 200);
      var length = image.data.length;
      var maxDeathCooldown = 1.0;

      var alphaPercentage = deathCooldown / maxDeathCooldown;

      for(var i = 3; i < length; i = i + 4) {
        image.data[i-1] = image.data[i-1] + 150;
        image.data[i-2] = image.data[i-2] + 150;
        image.data[i-3] = image.data[i-3] + 150;

        if(image.data[i] > 0) { image.data[i] *= alphaPercentage; }
      }

      this.c.putImageData(image, x, y);
    },

    drawUsers: function (users) {
      _.each(users, function (user) {
        var x = user.x - (this.spriteWidth / 2);
        var y = this.floorY + user.y - this.spriteHeight + this.spriteBottomPadding;
        var deathCooldown = user.deathCooldown;
        var spriteX;
        var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };

        if (this.drawBoundingBox)
          this.c.strokeRect(x, y, 100, 200);
        if (this.drawServerOrigin)
          this.c.fillRect(serverOrigin.x, serverOrigin.y, 5, 5);

        if (user.dir === 1) {
          spriteX = 0;
          if (user.state == 'jumping') spriteX = 200;
          else if (user.state == 'kicking') spriteX = 400;

          if(user.state == "dying") {
            spriteX = 400;
            if (user.deathState == 'jumping') spriteX = 200;
            else if (user.deathState == 'standing') spriteX = 0;
            this.deathImage(window.NodeKick.Assets.diveSprite, spriteX, x, y, deathCooldown);
          } else {
            this.c.drawImage(window.NodeKick.Assets.diveSprite, spriteX, 0, 200, 400, x, y, 100, 200);
          }
        }
        else {
          spriteX = 0;
          if (user.state == 'jumping') spriteX = 200;
          else if (user.state == 'standing') spriteX = 400;

          if(user.state == "dying") {
            spriteX = 0;
            if (user.deathState == 'jumping') spriteX = 200;
            else if (user.deathState == 'standing') spriteX = 400;
            this.deathImage(window.NodeKick.Assets.diveSpriteInverted, spriteX, x, y, deathCooldown);
          } else {
            this.c.drawImage(window.NodeKick.Assets.diveSpriteInverted, spriteX, 0, 200, 400, x, y, 100, 200);
          }
        }

        // this.drawAvatar(user, serverOrigin.x, serverOrigin.y - 140);
        this.drawAvatar(user, serverOrigin.x, this.floorY + 50);
      }, this);
    }
  };

})();
