(function () {
  'use strict';

  var node = typeof window === 'undefined';
  var app = node ? null : window.app;

  var _ = node ? require('underscore') : window._;
  var Backbone = node ? require('backbone') : window.Backbone;

  var Model = Backbone.Model.extend({
    constructor: function () {
      this.constructor.relations();
      Backbone.Model.apply(this, arguments);
    },

    validate: function (attrs, options) {
      if (!this.validators) return;
      var ers = {};
      this.cleaned = {};
      for (var key in this.validators) {
        var val = this.validators[key];
        var er = val.call(this, attrs[key], options);
        if (er) ers[key] = er;
      }
      if (_.size(ers)) return ers;
    }
  }, {
    relations: function () {
      if (this._relations) return this._relations;
      var relations = _.result(this.prototype, 'relations');
      if (!relations) return this._relations = {};
      relations = _.reduce(relations, function (rels, rel, key) {
        var Model =
          node ?
          require('./' + (rel.hasOne || rel.hasMany)) :
          app[_.str.classify(rel.hasOne || rel.hasMany)];
        if (rel.hasOne) rel.hasOne = Model;
        if (rel.hasMany) rel.hasMany = Model.Collection;
        if (!rel.via) {
          var complement = Model.prototype.relations;
          var hasOne = !rel.hasOne;
          var fk = rel.fk;
          rel.reverse = _.reduce(complement, function (reverse, rel, key) {
            if (!rel.via && hasOne !== !rel.hasOne && fk === rel.fk) return key;
            return reverse;
          }, null);
        }
        rels[key] = rel;
        return rels;
      }, {});
      return this._relations = this.prototype.relations = relations;
    }
  });

  Model.Collection = Backbone.Collection.extend({
    model: Model,

    url: function () {
      return _.result(this.model.prototype, 'urlRoot');
    }
  });

  node ? module.exports = Model : app.Model = Model;
})();
