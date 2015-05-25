var path = require('path'),
  fs = require('fs'),
  q = require('q'),
  _ = require('lodash'),
  request = require('request');


var pathToData = '../../data/npm-all.json';
var allPackagesUrl = 'https://registry.npmjs.org/-/all';
var packageNames = require(pathToData);

module.exports = {
  packageNames: packageNames,
  refresh: function() {
    var def = q.defer();
    request.get({
      url: allPackagesUrl,
      json: true
    }, function(err, response, data) {
        if (err) {
          console.error('cannot fetch', allPackagesUrl);
          return def.reject(err);
        }
        packageNames = _.reduce(data, function(memo, pack, name) {
          if (pack['dist-tags'] && name !== '_updated') {
            memo.push(name);
          }
          return memo;
        }, []);

        fs.writeFile(
          path.join(__dirname, pathToData),
          JSON.stringify(packageNames), function(err) {
            if (err) {
              console.error('cannot write to npm-all.json');
              return def.reject(err);
            }
            def.resolve(packageNames);
          }
        );
      });
    return def.promise;
  }
};
