(function () {
  'use strict';

  var app = window.app;

  var $ = window.jQuery;

  window.Backbone.ajax = function (options) {
    if (app.config.mobile) return $.ajax.apply($, arguments);
    app.live.send(options.type + ' ' + options.url, JSON.parse(options.data));
  };
})();
