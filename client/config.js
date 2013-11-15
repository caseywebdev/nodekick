(function () {
  'use strict';

  var mobileUserAgentRe = /iPod|iPhone|iPad|Android/i;

  window.app.config = {
    mobile: mobileUserAgentRe.test(navigator.userAgent),
    gravity: 7000,
    jumpPower: 3000,
    kickPower: 1500,
    recentKillDuration: 3000,
    fps: 60
  };
})();
