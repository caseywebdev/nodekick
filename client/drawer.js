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
        avatar.onload = function () { avatar.loaded = true; console.log('asdf') };
        avatar.src = userData.avatar;
        avatar.width = this.avatarSize;
        avatar.height = this.avatarSize;
      }
      if (avatar.loaded) this.c.drawImage(avatar, x, y, this.avatarSize, this.avatarSize);
    },

    drawUsers: function (users) {
      _.each(users, function (user) {

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

        this.drawAvatar(user, serverOrigin.x, serverOrigin.y - 180);
        this.c.fillRect(serverOrigin.x, this.floorY + 50, 5, 5);
        this.c.fillRect(serverOrigin.x, serverOrigin.y - 180, 5, 5);

      }, this);

    }
  };

})();
