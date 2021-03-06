//= require ../../view.js

(function () {
  'use strict';

  var app = window.app;

  var JST = window.JST;
  var requestAnimFrame = window.requestAnimFrame;

  app.UsersRecentShowView = app.View.extend({
    template: JST['templates/users/recent/show'],

    className: 'js-users-recent-show',

    initialize: function () {
      this.listenTo(this.model, 'change:kills', this.updateScore);
    },

    updateScore: function () {
      this.$('.js-kills').text(this.model.get('kills'));
      var $el = this.$el;
      $el.removeClass('js-ease').addClass('js-changed');
      requestAnimFrame(function () {
        $el.addClass('js-ease').removeClass('js-changed');
      });
    }
  });
}());
