/* global Backbone,Bloodhound, _, MyApp */
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
      'typeahead:autocompleted': 'packageSelected',
      'submit #search-form': 'formSubmitted'
    },

    packageSelected: function(e, item) {
      this.sendPackage(item.value);
    },

    formSubmitted: function () {
      this.sendPacakge(this.$el.val());
    },

    sendPackage: function (packageName) {
      var packageStat = new PackageStat({name: packageName});
      packageStat.fetch().then(_.bind(function() {
        this.trigger('packageSelected', packageStat);
      }, this));
    },

    initialize: function () {
      // initialize typeahead and bloodhound
      var typeheadSource = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // prefetch: '../data/films/post_1960.json',
        remote: {
          url: '/api/packages?q=%QUERY',
          ajax: {global: false},
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
    // tagName: 'li',
    // className: 'list-group-item',

    initialize: function() {
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function () {
      this.$el.html(MyApp.templates.package(this.model.toJSON()));
      return this;
    },
    clear: function () {
      // we don't have a .remove() (api end point to delete...)
      this.model.trigger('destroy', this.model, this.model.collection);
    }
  });

  var PackageListView = Backbone.View.extend({
    el: '#package-list',

    initialize: function () {
      this.listenTo(this.collection, 'add', this.add);
    },
    add: function (pkg) {
      var packageView = new PackageView({model: pkg});
      this.$el.append(packageView.render().$el);
    }

  });


  var AppView = Backbone.View.extend({
    el: '#app',
    initialize: function() {
      var spinner = $('#spinner-modal');
      this.searchView = new SearchView({ el: '#search-input' });
      this.searchView.on('packageSelected', this.addPackage, this);

      this.packageList = new PackageStats([]);
      this.listView = new PackageListView({collection: this.packageList});

      // spinner
      $(document).ajaxStart(function(){
        spinner.modal('show');
      });
      $(document).ajaxComplete(function(){
        spinner.modal('hide');
      });

    },

    addPackage: function (pkg) {
      this.packageList.add(pkg);
    }

  });

  new AppView();

});
