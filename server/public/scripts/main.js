/* global Backbone,Bloodhound, _ */
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
      this.searchView = new SearchView({ el: '#search-input' });
      this.searchView.on('packageSelected', this.addPackage, this);

      this.packageList = new PackageStats([]);
      this.listView = new PackageListView({collection: this.packageList});
      // debug
//       this.packageList.add(

// {
//   "name": "grunt-koko",
//   "description": "grunt plugin to start koko as task.",
//   "lastVersion": "0.2.1",
//   "created": "2013-04-09T14:58:27.686Z",
//   "modified": "2014-07-11T03:33:31.163Z",
//   "prettyCreated": "1 year ago",
//   "prettyModified": "2 months ago",
//   "repository": {
//     "type": "git",
//     "url": "git@github.com:fnobi/grunt-koko.git"
//   },
//   "repositoryUrl": "git@github.com:fnobi/grunt-koko.git",
//   "author": {
//     "name": "Fujisawa Shin"
//   },
//   "authorName": "Fujisawa Shin",
//   "github": {
//     "is_fork": false,
//     "updated_at": "2014-07-11T03:31:48Z",
//     "pushed_at": "2014-07-11T03:33:53Z",
//     "stargazers_count": 0,
//     "watchers_count": 0,
//     "has_issues": true,
//     "forks_count": 2,
//     "open_issues_count": 0,
//     "subscribers_count": 2
//   }
// })
    },
    addPackage: function (pkg) {
      this.packageList.add(pkg);
    }

  });

  new AppView();

});
