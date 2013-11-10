(function () {
  var _ = window._;

  window.app.Drawer = {

    floorY: 570,
    spriteHeight: 200,
    spriteWidth: 100,
    spriteBottomPadding: 15,
    parallaxLocationX: 0,
    parallaxLocationY: 0,
    isDaytime: true,
    lengthOfDay: 60000,

    drawServerOrigin: false,
    drawBoundingBox: false,
    drawFloorLine: false,
    drawGuidelines: false,

    avatars: {},
    avatarSize: 30,

    init: function () {
      this.canvas = window.document.getElementById('stage');
      this.c = this.canvas.getContext('2d');

      this.c.fillStyle = '#F00';
      this.c.strokeStyle = '#0F0';

      this.createClouds();
      this.fakeTransition();
    },


    parallax: function (users, user) {
      var x;
      var y;
      if (user) {
        x = user.get('x');
        y = user.get('y');
      } else if (users.length === 0) {
        x = 575;
        y = 570;
      } else {
        var sum = users.reduce(function (sum, user) {
          return {x: sum.x + user.get('x'), y: sum.y + user.get('y')};
        }, {x: 0, y: 0});
        x = sum.x / users.length;
        y = sum.y / users.length;
      }
      this.parallaxLocationX = -1 * x / 45;
      this.parallaxLocationY = -1 * y / 45;
    },

    createClouds: function() {
      this.clouds = [];

      this.clouds.push({
        x: Math.random() * 1200,
        y: Math.random() * 150,
        width: 250,
        height: 250,
        sprite: 0,
        speed: .2
      });

      this.cloudSpriteLocations = [];
      this.cloudSpriteLocations.push({
        x: 0,
        y: 0,
        width: 450,
        height: 250
      });
    },

    fakeTransition: function () {
      var self = this;
      setInterval(function () {
        self.isDaytime = !self.isDaytime;
        self.createClouds();
      }, this.lengthOfDay)
    },

    drawBackground: function () {
      this.c.clearRect(0, 0, this.canvas.width, this.canvas.height);

      var backNear, backDistant;
      if (this.isDaytime) {
        backNear = window.app.Assets.backgroundImages['background-daytime.png'];
        backDistant = window.app.Assets.backgroundImages['background-daytime-distant.png'];
      }
      else {
        backNear = window.app.Assets.backgroundImages['background-nighttime.png'];
        backDistant = window.app.Assets.backgroundImages['background-nighttime-distant.png'];
      }
      this.c.drawImage(backDistant, this.parallaxLocationX, this.parallaxLocationY, this.canvas.width + 50, this.canvas.height + 50);
      this.c.drawImage(backNear, 0, this.parallaxLocationY / 5, this.canvas.width, this.canvas.height);

      if (this.isDaytime) {
        var cloudSprite = window.app.Assets.backgroundImages['cloud-sprite.png'];

        _.each(this.clouds, function(cloud) {
          cloud.x -= cloud.speed;
          //this.c.drawImage(cloudSprite, cloud.x, cloud.y, cloud.width, cloud.height, 0, 0, 200, 250);
          var spriteInfo = this.cloudSpriteLocations[cloud.sprite];
          this.c.drawImage(cloudSprite, spriteInfo.x, spriteInfo.y, spriteInfo.width, spriteInfo.height, cloud.x, cloud.y, cloud.width, cloud.height);

          //this.c.strokeRect(cloud.x, cloud.y, cloud.width, cloud.height);
        }, this);


      }

      if (this.drawFloorLine) {
        this.c.beginPath();
        this.c.moveTo(0, this.floorY);
        this.c.lineTo(this.canvas.width, this.floorY);
        this.c.stroke();
      }

      if (this.drawGuidelines) {
        for (var i = 0; i < 1300; i = i + 100) {
          this.c.beginPath();
          this.c.moveTo(i, 0);
          this.c.lineTo(i, this.canvas.height);
          this.c.stroke();

          this.c.beginPath();
          this.c.moveTo(0, i);
          this.c.lineTo(this.canvas.width, i);
          this.c.stroke();

          for (var j = 0; j < 13; j++)
          this.c.fillText('(' + i + ', ' + (j * 100) + ')', i + 2, (j * 100) + 9);
        }
      }
    },

    drawAvatar: function (user, x, y) {
      var avatar = this.avatars[user.id];
      if (!avatar) {
        avatar = this.avatars[user.id] = new Image();
        avatar.onload = function () {
          avatar.loaded = true;
        };
        avatar.src = '/avatars/' + user.id;
      }
      if (avatar.loaded) {
        x = x - this.avatarSize / 2;
        y = y - this.avatarSize / 2;
        this.c.drawImage(avatar, x, y, this.avatarSize, this.avatarSize);
      }
    },

    deathImage: function(sprite, spriteX, x, y, deathCooldown) {
      var deathCanvas = window.document.getElementById('deathCanvas');
      var deathContext = deathCanvas.getContext('2d');
      deathContext.clearRect(0, 0, 100, 200);
      deathContext.drawImage(sprite, spriteX, 0, 200, 400, 0, 0, 100, 200);
      var stageSource = this.c.getImageData(x, y, 100, 200);
      var image = deathContext.getImageData(0, 0, 100, 200);
      var length = image.data.length;
      var maxDeathCooldown = 1.0;

      var alphaPercentage = deathCooldown / maxDeathCooldown;


      for(var i = 3; i < length; i += 4) {

        if(image.data[i] > 0 && image.data[i - 1] > 0 && image.data[i - 2] > 0 && image.data[i - 3] > 0) {
          image.data[i-1] = image.data[i-1] + 150;
          image.data[i-2] = image.data[i-2] + 150;
          image.data[i-3] = image.data[i-3] + 150;
          image.data[i] *= alphaPercentage;

        }
      }

      deathContext.putImageData(stageSource, 0, 0);



      var newData = deathContext.getImageData(0, 0, 100, 200);


      for(var i = 3; i < length; i += 4) {

        if(image.data[i] > 0 && image.data[i - 1] > 0 && image.data[i - 2] > 0 && image.data[i - 3] > 0) {
          newData.data[i-1] = image.data[i-1];
          newData.data[i-2] = image.data[i-2];
          newData.data[i-3] = image.data[i-3];
          newData.data[i] = image.data[i];
        }
      }


      //deathContext.putImageData(image, 0, 0);
      this.c.putImageData(newData, x, y);

      var anotherCanvas = document.getElementById('anotherCanvas');
      var anotherContext = anotherCanvas.getContext('2d');
      anotherContext.putImageData(image, 0, 0);
    },

    drawUser: function(user) {
      var x = user.get('x') - (this.spriteWidth / 2);
      var y = this.floorY + user.get('y') - this.spriteHeight + this.spriteBottomPadding;
      var deathCooldown = user.deathCooldown;
      var spriteX;
      var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };
      var sprite = window.app.Assets.getSprite(user);

      if (this.drawBoundingBox)
        this.c.strokeRect(x, y, 100, 200);
      if (this.drawServerOrigin)
        this.c.fillRect(serverOrigin.x, serverOrigin.y, 5, 5);

      if (user.get('dir') === 1) {
        spriteX = 0;
        if (user.isJumping()) spriteX = 200;
        else if (user.isKicking()) spriteX = 400;

        if(user.isDead()) {
          spriteX = 400;
          if (user.get('deathState') == 'jumping') spriteX = 200;
          else if (user.get('deathState') == 'standing') spriteX = 0;
          this.deathImage(sprite, spriteX, x, y, deathCooldown);
        } else {
          this.c.drawImage(sprite, spriteX, 0, 200, 400, x, y, 100, 200);
        }
      }
      else {
        spriteX = 0;
        if (user.isJumping()) spriteX = 200;
        else if (user.isStanding()) spriteX = 400;

        if(user.isDead()) {
          spriteX = 0;
          if (user.get('deathState') == 'jumping') spriteX = 200;
          else if (user.get('deathState') == 'standing') spriteX = 400;
          this.deathImage(sprite.inverted, spriteX, x, y, deathCooldown);
        } else {
          this.c.drawImage(sprite.inverted, spriteX, 0, 200, 400, x, y, 100, 200);
        }
      }
    },

    drawUsers: function(users, currentUserId) {
      this.parallax(users, users.get(currentUserId));
      var deadUsers = users.where({state: 'dead'});
      var liveUsers = users.difference(deadUsers);
      _.each(deadUsers, _.bind(this.drawUser, this));
      _.each(liveUsers, _.bind(this.drawUser, this));
      users.each(function (user) {
        var x = user.get('x') - (this.spriteWidth / 2);
        var y = this.floorY + user.get('y') - this.spriteHeight + this.spriteBottomPadding;
        var serverOrigin = { x: x + (this.spriteWidth / 2), y: y + this.spriteHeight };
        this.drawAvatar(user, serverOrigin.x, this.floorY + 50);
      }, this);
    }
  };

})();
