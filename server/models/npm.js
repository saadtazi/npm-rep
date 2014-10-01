var npm = require('npm'),
    q = require('q'),
    request = require('request'),
    prettyDate = require('pretty-date'),

    registryUrl = 'https://registry.npmjs.org/',
    typeAheadUrl = 'https://typeahead.npmjs.com/search';

// required for oldSearch... that is too slow...
// var npmLoadedDefer = q.defer(),
//     npmLoaded = npmLoadedDefer.promise;

// npm.load({}, function (er) {
//   if (er) return console.error('npm load error::', err);
//   npmLoadedDefer.resolve();
// })

module.exports = {
  // too slow
  // oldSearch: function (query) {
  // npmLoaded.then(function () {
    //   npm.commands.search([query], function (err, packages) {
    //     if (err) { searchDef.reject(err); return; }
    //     // why there are no rest api... why... why...

    //     searchDef.resolve(packages);
    //   });
    // });
  // }
  search: function (query) {
    var searchDef = q.defer();
    request.get({url: typeAheadUrl, qs: {q: query}, json:true}, function (e, r, data) {
      if (e) { searchDef.reject(e); return; }
      // searchDef.resolve(data.map(function(item) { return item.value; }));
      searchDef.resolve(data);
    });

    return searchDef.promise;
  },

  getPackage: function (packageName) {
    var infoDef = q.defer();
    request.get({url: registryUrl + packageName, json:true}, function (e, r, data) {
      if (e) { infoDef.reject(e); return; }
      infoDef.resolve(data);
    });
    return infoDef.promise;
  },

  getPackageStats: function (packageName) {

    return this.getPackage(packageName).then(
      function (data) {
        try {
        var lastVersion = data['dist-tags'].latest;
        lastPackage = data.versions[lastVersion];
        return {
          name: data.name,
          description: data.description,
          lastVersion: lastVersion,
          nbDependencies: lastPackage.dependencies && lastPackage.dependencies.length,
          nbContributors: data.contributors && data.contributors.length,
          created: data.time.created,
          modified: data.time.modified,
          prettyCreated: prettyDate.format(new Date(data.time.created)),
          prettyModified: prettyDate.format(new Date(data.time.modified)),
          repository: data.repository,
          repositoryUrl: data.repository && data.repository.url,
          homePage: data.homepage,
          author: data.author,
          authorName: data.author && data.author.name
        };
      } catch (e) {console.log('err', e);}
      }
    );
    return statsDef.promise;
  }
}
