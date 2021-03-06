(function () {
  'use strict';

  window.app.config = {
    mobile: /i(Phone|Pod|Pad)|Android/.test(navigator.userAgent),
    game: {
      gravity: 6000,
      jumpPower: 3000,
      kickPower: 1400,
      recentKillDuration: 3000,
      fps: 60,
      messageDuration: 3000,
      messageThrottleDuration: 1000,
      width: 2880,
      height: 1620
    },
    soundTracks: 5,
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
