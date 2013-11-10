(function () {
  var Backbone = window.Backbone;
  // var _ = window._;
  // var $ = window.$;

  var ScoreView = window.ScoreView = Backbone.View.extend({
    template: window.jst.score,
    className: 'score',
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      this.$el.html(this.template(this.model));
      return this;
    }
  });

  window.ScoresListView = Backbone.View.extend({
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
