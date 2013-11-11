(function () {
  'use strict';

  var Backbone = window.Backbone;

  var ScoreView = window.app.ScoreView = Backbone.View.extend({
    template: window.jst.score,
    className: 'score',
    initialize: function () {
      this.listenTo(this.model, 'change:score', this.updateScore);
    },
    render: function () {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },
    updateScore: function () {
      this.$('.js-kills').text(this.model.get('score') || 0);
      var $el = this.$el;
      $el.removeClass('js-ease').addClass('js-changed');
      window.requestAnimationFrame(function () {
        $el.addClass('js-ease').removeClass('js-changed');
      });
    }
  });

  window.app.ScoresListView = Backbone.View.extend({
    el: '#scoreboard',
    initialize: function () {
      this.listenTo(this.collection, {
        'add': this.addModel,
        'sort': this.sortModels,
        'remove': this.removeModel
      });
      this.views = {};
    },
    addModel: function (model) {
      (this.views[model.id] = new ScoreView({model: model})).render();
    },
    removeModel: function (model) {
      this.views[model.id].remove();
      delete this.views[model.id];
    },
    sortModels: function () {
      this.$el.html(this.collection.map(function (model) {
        return this.views[model.id].$el.detach();
      }, this));
    }
  });
}());
