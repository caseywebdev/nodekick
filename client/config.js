(function () {
  'use strict';

  window.app.config = {
    mobile: window.screen.width < 768,
    gravity: 7000,
    jumpPower: 3000,
    kickPower: 1500,
    recentKillDuration: 3000,
    fps: 60,
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
