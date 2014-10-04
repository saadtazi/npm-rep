/* global Backbone,Bloodhound, _, MyApp, store, ga */
$(function () {
  'use strict';

  var PackageStat = Backbone.Model.extend({
    idAttribute: 'name',
    urlRoot: '/api/package-stats'

  });

  var PackageStats = Backbone.Collection.extend({
    likedStoreKey: 'likedPackages',
    model: PackageStat,
    loadLiked: function () {
      var likedPackages = store.get(this.likedStoreKey);
      if (likedPackages) {
        var self = this;
        _.each(likedPackages, function (likedPackage) {
          var pkg = new PackageStat(_.extend(likedPackage, {
            liked: true
          }));
          pkg.fetch().then(function () {
            self.add(pkg);
          });
        });
      }
    },
    saveLiked: function () {
      store.set(
        this.likedStoreKey,
        this.chain()
        .filter(function (pkg) {
          return pkg.get('liked') === true;
        })
        .map(function (pkg) {
          return {
            name: pkg.get('name'),
            liked: pkg.get('liked')
          };
        })
        .value()
      );
    }
  });


  var SearchView = Backbone.View.extend({
    // does not work, not sure why...
    events: {
      'typeahead:selected': 'packageSelected',
      'typeahead:autocompleted': 'packageSelected',
      'submit #search-form': 'formSubmitted'
    },

    packageSelected: function (e, item) {
      this.sendPackage(item.value);
    },

    formSubmitted: function () {
      this.sendPacakge(this.$el.val());
    },

    sendPackage: function (packageName) {
      var packageStat = new PackageStat({
        name: packageName
      });
      packageStat.fetch().then(_.bind(function () {
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
          ajax: {
            global: false
          },
          filter: function (parsedResponse) {
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
      'click .delete': 'clear',
      'click .likedBtn': 'like'
    },

    initialize: function () {
      this.listenTo(this.model, 'destroy', this.remove);
    },
    render: function () {
      this.$el.html(MyApp.templates.package(this.model.toJSON()));
      return this;
    },
    clear: function () {
      // we don't have a .remove() (api end point to delete...)
      ga('send', 'event', 'package', 'removed', this.model.get('name'));

      this.model.trigger('destroy', this.model, this.model.collection);
    },
    like: function () {
      var newLiked = !this.model.get('liked'),
        eventAction = newLiked ? 'liked' : 'unliked';
      ga('send', 'event', 'like', eventAction, this.model.get('name'));
      this.model.set('liked', !this.model.get('liked'));
      this.$el.find('.likedBtn').toggleClass('liked');

    }
  });

  var PackageListView = Backbone.View.extend({
    el: '#package-list',

    initialize: function () {
      this.listenTo(this.collection, 'add', this.add);
    },
    add: function (pkg) {
      var packageView = new PackageView({
        model: pkg
      });
      this.$el.prepend(packageView.render().$el);
    }

  });


  var AppView = Backbone.View.extend({
    el: '#app',
    initialize: function () {
      var spinner = $('#spinner-modal');
      this.searchView = new SearchView({
        el: '#search-input'
      });
      this.searchView.on('packageSelected', this.addPackage, this);

      this.packageList = new PackageStats();
      this.listView = new PackageListView({
        collection: this.packageList
      });

      this.packageList.loadLiked();

      // spinner
      $(document).ajaxStart(function () {
        spinner.modal('show');
      });
      $(document).ajaxComplete(function () {
        spinner.modal('hide');
      });

      this.listenTo(this.packageList, 'change:liked', _.bind(this.likedChanged, this));
    },

    likedChanged: function () {
      this.packageList.saveLiked();
    },

    addPackage: function (pkg) {
      ga('send', 'event', 'package', 'added', pkg.get('name'));
      this.packageList.add(pkg);
    }

  });

  window.app = new AppView();

});
