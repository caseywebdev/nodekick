(function () {
  'use strict';

  var app = window.app;

  var Backbone = window.Backbone;

  var ajax = Backbone.ajax;
  Backbone.ajax = function (options) {
    if (app.config.mobile) return ajax.apply(Backbone, arguments);
    app.live.send(options.type + ':' + options.url, JSON.parse(options.data));
  };
})();
