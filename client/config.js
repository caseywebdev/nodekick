(function () {
  'use strict';

  var mobileUserAgentRe = /iPod|iPhone|iPad|Android/i;

  window.app.config = {
    mobile: mobileUserAgentRe.test(navigator.userAgent),
    gravity: 7000,
    jumpPower: 3000,
    kickPower: 1500,
    recentKillDuration: 3000,
    fps: 60,
    mps: 30,
    soundTracks: 5,
    messageDuration: 3000,
    messageThrottleDuration: 1000,
    sounds: [
      'death-from-above',
      'dominating',
      'double-kill',
      'godlike',
      'headshot',
      'killing-streak',
      'monster-kill',
      'rampage',
      'triple-kill',
      'unstoppable'
    ]
  };
})();
