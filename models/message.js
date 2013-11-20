//= require ./model

(function () {
  'use strict';

  var node = typeof window === 'undefined';

  var app = node ? null : window.app;

  var $ = node ? null : window.jQuery;
  var _ = node ? require('underscore') : window._;
  var Model = node ? require('./model') : app.Model;

  var Message = Model.extend({
    relations: {
      user: {hasOne: 'user'}
    },

    html: function () {
      var $div = $('<div>').text(this.get('text'));
      var avatar = this.get('user').get('avatar');
      if (avatar) $div.prepend($('<img>').attr('src', avatar));
      return $div.html();
    },

    toJSON: function () {
      return _.extend({
        user: this.get('user')
      }, this.attributes);
    }
  });

  Message.Collection = Model.Collection.extend({
    model: Message,
  });

  node ? module.exports = Message : app.Message = Message;
})();
