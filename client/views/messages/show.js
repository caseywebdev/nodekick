//= require ../view

(function () {
  'use strict';

  var app = window.app;

  var _ = window._;
  var View = app.View;

  app.MessageShowView = View.extend({
    className: 'js-message',

    render: function () {
      View.prototype.render.apply(this, arguments);
      this.$el.html(this.model.html()).appendTo('body');
      _.delay(_.bind(this.remove, this), app.config.messageDuration);
      app.playSound(this.model.get('soundId'));
      return this;
    }
  });
})();
