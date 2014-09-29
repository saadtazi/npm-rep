var npm = require('npm'),
    q = require('q'),
    request = require('request'),

    registryUrl = 'https://registry.npmjs.org/';

var npmLoadedDefer = q.defer(),
    npmLoaded = npmLoadedDefer.promise;

npm.load({}, function (er) {
  if (er) return console.error('npm load error::', err);
  npmLoadedDefer.resolve();
})

module.exports = {
  // too slow
  search: function (query) {
    var searchDef = q.defer();
    npmLoaded.then(function () {
      npm.commands.search([query], function (err, packages) {
        if (err) { searchDef.reject(err); return; }
        // why there are no rest api... why... why...
        // remove first line (header)

        searchDef.resolve(packages);
      });
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
        var lastVersion = data['dist-tags'].latest;
        lastPackage = data.versions[lastVersion];
        return {
          name: data.name,
          lastVersion: lastVersion,
          nbDependencies: lastPackage.dependencies && lastPackage.dependencies.length,
          nbContributors: data.contributors && data.contributors.length,
          created: data.time.created,
          modified: data.time.modified,
          repository: data.repository,
          repositoryUrl: data.repository && data.repository.url,
          homePage: data.homepage,
          author: data.author,
          authorName: data.author.name
        };
      }
    );
    return statsDef.promise;
  }
}
