$(function() {
  'use strict';

  var PackageStat = Backbone.Model.extend({
    idAttribute: 'name',
    urlRoot: '/api/package-stats'

  });

  var PackageStats = Backbone.Collection.extend({
    model: PackageStat
  });

  var SearchView = Backbone.View.extend({
    // does not work, not sure why...
    events: {
      'typeahead:selected': 'packageSelected',
      'typeahead:autocompleted': 'packageSelected'
    },

    packageSelected: function(e, item) {
      console.log('addToList::', arguments);
      console.log(arguments);
      var packageStat = new PackageStat({name: item.value});
      packageStat.fetch().then(function() { Backbone.trigger('packageSelected', packageStat)})
    },

    initialize: function (opt) {
      // initialize typeahead and bloodhound
      var typeheadSource = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // prefetch: '../data/films/post_1960.json',
        remote: {
          url: '/api/packages?q=%QUERY',
          filter: function(parsedResponse) {
              return parsedResponse && parsedResponse.items;
          }
        }
      });
      typeheadSource.initialize();

      this.$el.typeahead(null, {
        name: 'search-input',
        source: typeheadSource.ttAdapter(),
        displayKey: 'value',
      });
    }
  });

  var PackageView = Backbone.View.extend({
    events: {
      'click .delete': 'clear'
    },
    tagName: 'li',
    initialize: function() {
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function () {
      this.$el.html(this.model.get('name') + ' <span class="delete">x</span>');
      return this;
    },
    clear: function () {
      // we don't have a .remove() (api end point to delete...)
      this.model.trigger('destroy', this.model, this.model.collection);
    }
  });

  var PackageListView = Backbone.View.extend({
    el: '#package-list',

    initialize: function (opts) {
      this.listenTo(this.collection, 'add', this.add);
    },
    add: function (pkg) {
      var packageView = new PackageView({model: pkg});
      this.$el.append(packageView.render().$el)
    }

  });


  var AppView = Backbone.View.extend({
    el: '#app',
    initialize: function() {
      this.searchView = new SearchView({ el: '#search-input' });
      this.packageList = new PackageStats([]);
      this.listView = new PackageListView({collection: this.packageList});
      // how to do that in a better way.... in searchVhiew: this.$el.trigger?
      Backbone.on('packageSelected', this.addPackage, this);
    },
    addPackage: function (pkg) {
      this.packageList.add(pkg);
    }

  });

  new AppView();

});
