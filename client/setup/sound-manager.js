(function () {
  'use strict';

  var app = window.app;

  window.soundManager.setup({
    debugMode: false,
    useFlashBlock: false,
    useHighPerformance: true,
    flashVersion: 9,
    url: '/flash/',
    onready: app.soundManagerReady
  });
})();
