(function () {
  'use strict';

  var mobileUserAgentRe = /iPod|iPhone|iPad|Android/i;

  window.config = {
    mobile: navigator.userAgent.test(mobileUserAgentRe)
  };
})();
