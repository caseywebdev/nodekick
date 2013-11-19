(function () {
  'use strict';

  var app = window.app;

  var $ = window.jQuery;

  $.ajaxSetup({
    beforeSend: function (xhr) {
      xhr.setRequestHeader('X-CSRF-Token', app.csrfToken);
    }
  });
})();
