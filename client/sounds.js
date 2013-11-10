if (!window.NodeKick)
  window.NodeKick = { };

(function () {
  var _ = window._;

  soundManager.setup({
    url: '/swf/',
    // optional: use 100% HTML5 mode where available
    // preferFlash: false,
    onready: function() {
      window.NodeKick.Sounds = {
        playRandomDeath: function() {
          var mySound = soundManager.createSound({
            id: 'aSound',
            url: '/mp3/ouch.mp3'
          });
          mySound.play();
        }
      };
    },
    ontimeout: function() {
      // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
    }
  });
})();
