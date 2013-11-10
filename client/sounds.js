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
      };

      window.NodeKick.Sounds.deathfromabove = soundManager.createSound( { id: 'deathfromabove' , url: '/mp3/deathfromabove.mp3' });
      window.NodeKick.Sounds.dominating = soundManager.createSound( { id: 'dominating' , url: '/mp3/dominating.mp3' });
      window.NodeKick.Sounds.doublekill = soundManager.createSound( { id: 'doublekill' , url: '/mp3/doublekill.mp3' });
      window.NodeKick.Sounds.godlike = soundManager.createSound( { id: 'godlike' , url: '/mp3/godlike.mp3' });
      window.NodeKick.Sounds.headshot = soundManager.createSound({ id: 'headshot', url: '/mp3/headshot.mp3' });
      window.NodeKick.Sounds.killingstreak = soundManager.createSound( { id: 'killingstreak' , url: '/mp3/killingstreak.mp3' });
      window.NodeKick.Sounds.monsterkill = soundManager.createSound( { id: 'monsterkill' , url: '/mp3/monsterkill.mp3' });
      window.NodeKick.Sounds.rampage = soundManager.createSound( { id: 'rampage' , url: '/mp3/rampage.mp3' });
      window.NodeKick.Sounds.triplekill = soundManager.createSound( { id: 'triplekill' , url: '/mp3/triplekill.mp3' });
      window.NodeKick.Sounds.unstoppable = soundManager.createSound( { id: 'unstoppable' , url: '/mp3/unstoppable.mp3' });

    },
    ontimeout: function() {
      // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
    }
  });
})();
