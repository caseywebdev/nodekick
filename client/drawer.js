if (!window.NodeKick)
  window.NodeKick = {};

(function () {
  var _ = window._;

  window.NodeKick.Drawer = {

    floorY: 570,
    spriteHeight: 200,
    spriteWidth: 100,
    spriteBottomPadding: 15,
    parallaxLocationX: 0,
    parallaxLocationY: 0,
    isDaytime: true,

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

      //this.fakeParallax();
      //this.fakeTransition();
    },

    /*fakeParallax: function() {
      var self = this;
      var parallaxDirection = -1;
      setInterval(function() {

        self.paralaxLocation += (1 * parallaxDirection);

        if (self.paralaxLocation <= -50)
          parallaxDirection = 1;
        else if (self.paralaxLocation >= 0)
          parallaxDirection = -1;

      }, 30);
    },*/

    parallax: function(user) {

      if (!user)
        return;

      //console.log('user', user);
      var self = this;
      var parallaxDirection = -1;

      this.parallaxLocationX = -1 * user.x / 45;
      this.parallaxLocationY = -1 * user.y / 45;

    },

    fakeTransition: function() {
      var self = this;
      setInterval(function() {
        self.isDaytime = !self.isDaytime;
      }, 60000)
    },

    drawBackground: function () {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

      var backNear, backDistant;
      if (this.isDaytime) {
        backNear = window.NodeKick.Assets.backgroundImages['background-daytime.png'];
        backDistant = window.NodeKick.Assets.backgroundImages['background-daytime-distant.png'];
      }
      else {
        backNear = window.NodeKick.Assets.backgroundImages['background-nighttime.png'];
        backDistant = window.NodeKick.Assets.backgroundImages['background-nighttime-distant.png'];      
      }
      this.c.drawImage(backDistant, this.parallaxLocationX, this.parallaxLocationY, this.canvas.width + 50, this.canvas.height + 50);
      this.c.drawImage(backNear, 0, this.parallaxLocationY / 5, this.canvas.width, this.canvas.height);

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

    drawUser: function(user) {
      var x = user.x - (this.spriteWidth / 2);
      var y = this.floorY + user.y - this.spriteHeight + this.spriteBottomPadding;
      var deathCooldown = user.deathCooldown;
      var spriteX;
      var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };
      var sprite = window.NodeKick.Assets.getSprite(user);

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
          this.deathImage(sprite, spriteX, x, y, deathCooldown);
        } else {
          this.c.drawImage(sprite, spriteX, 0, 200, 400, x, y, 100, 200);
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
          this.deathImage(sprite.inverted, spriteX, x, y, deathCooldown);
        } else {
          this.c.drawImage(sprite.inverted, spriteX, 0, 200, 400, x, y, 100, 200);
        }
      }
    },

    drawUsers: function(users, currentUserId) {
      this.parallax(_.find(users, function(user) { return user.id == currentUserId}));
      var deadUsers = _.filter(users, function(user) { return user.state == "dying"; });
      var liveUsers = _.filter(users, function(user) { return user.state != "dying"; });
      _.each(deadUsers, function (user) { this.drawUser(user); }, this);
      _.each(liveUsers, function (user) { this.drawUser(user); }, this);
      _.each(users, function (user) {
        var x = user.x - (this.spriteWidth / 2);
        var y = this.floorY + user.y - this.spriteHeight + this.spriteBottomPadding;
        var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };
        this.drawAvatar(user, serverOrigin.x, this.floorY + 50);
      }, this);
    }
  };

})();
