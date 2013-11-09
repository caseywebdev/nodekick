(function () {
  'use strict';

  var mobileUserAgentRe = /iPod|iPhone|iPad|Android/i;

  window.config = {
    mobile: mobileUserAgentRe.test(navigator.userAgent)
  };
})();
