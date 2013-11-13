//= require ./view

(function () {
  'use strict';

  var app = window.app;

  var $ = window.$;
  var _ = window._;

  app.MainView = app.View.extend({
    controls: {
      '38': 'up',
      '87': 'up',
      '37': 'left',
      '65': 'left',
      '39': 'right',
      '68': 'right'
    },

    initialize: function () {
      this.dirPressed = {};
      _.bindAll(
        this,
        'onTouchstart',
        'onTouchmove',
        'onTouchend',
        'onKeydown',
        'onKeyup'
      );
      $(document).on({
        touchstart: this.onTouchstart,
        touchmove: this.onTouchmove,
        touchend: this.onTouchend,
        keydown: this.onKeydown,
        keyup: this.onKeyup
      });
    },

    onTouchstart: function (ev) {
      ev = ev.originalEvent;
      if (ev.touches.length !== 1) return;
      var touch = ev.touches[0];
      this.x0 = touch.screenX;
      this.y0 = touch.screenY;
    },

    onTouchmove: function (ev) {
      ev.preventDefault();
      ev = ev.originalEvent;
      if (ev.touches.length !== 1 || this.swiped) return;
      var touch = ev.touches[0];
      var dx = touch.screenX - this.x0;
      var dy = touch.screenY - this.y0;
      var rightLeft = dx > 0 ? 'right' : 'left';
      var downUp = dy > 0 ? 'down' : 'up';
      var val = Math.abs(dx) > Math.abs(dy) ? rightLeft : downUp;
      this.sendMove(val === 'down' ? rightLeft : val);
    },

    onTouchend: function (ev) {
      if (!ev.originalEvent.touches.length) this.swiped = false;
    },

    onKeydown: function (ev) {
      var dir = this.controls[ev.which];
      if (!dir) return;
      if (!this.dirPressed[dir]) this.sendMove(dir);
      this.dirPressed[dir] = true;
    },

    onKeyup: function (ev) {
      var dir = this.controls[ev.which];
      if (dir) this.dirPressed[dir] = false;
    },

    remove: function () {
      $(document).off({
        touchstart: this.onTouchstart,
        touchmove: this.onTouchmove,
        touchend: this.onTouchend,
        keydown: this.onKeydown,
        keyup: this.onKeyup
      });
    },

    sendMove: function (type) { (new app.Move({type: type})).save(); }
  });
})();
