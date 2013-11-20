//= require ../../view

(function () {
  'use strict';

  var app = window.app;

  var jst = window.jst;

  app.UsersRecentShowView = app.View.extend({
    template: jst['users/recent/show'],

    className: 'js-users-recent-show',

    initialize: function () {
      this.listenTo(this.model, 'change:kills', this.updateScore);
    },

    updateScore: function () {
      this.$('.js-kills').text(this.model.get('kills'));
      var $el = this.$el;
      $el.removeClass('js-ease').addClass('js-changed');
      window.requestAnimationFrame(function () {
        $el.addClass('js-ease').removeClass('js-changed');
      });
    }
  });
}());
