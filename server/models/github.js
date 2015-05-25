var q = require('q'),
  GithubApi = require('github'),
  prettyDate = require('pretty-date');

var github = new GithubApi({
  // required
  version: '3.0.0',
  // debug: true
});


module.exports = {
  isGithub: function(url) {
    return url.indexOf('github.com') > -1;
  },
  parseUrl: function(url) {
    var urlInfo = url.replace('.git', '').replace('github.com:', 'github.com/').split('/').slice(-2);
    return {
      user: urlInfo[0],
      repo: urlInfo[1]
    }
  },
  getRepo: function(repo) {
    var repoDef = q.defer();
    github.repos.get(repo, function(err, res) {
      if (err) {
        repoDef.reject(err); return;
      }
      repoDef.resolve(res);
    });
    return repoDef.promise;
  },

  getRepoStats: function(repo) {
    var def = q.defer();
    this.getRepo(repo).then(function(data) {

      def.resolve({
        is_fork: data.fork,
        created_at: data.created_at,
        updated_at: data.updated_at,
        pushed_at: data.pushed_at,
        prettyCreatedAt: prettyDate.format(new Date(data.created_at)),
        prettyUpdatedAt: prettyDate.format(new Date(data.updated_at)),
        prettyPushedAt: prettyDate.format(new Date(data.pushed_at)),
        stargazers_count: data.stargazers_count,
        watchers_count: data.watchers_count,
        has_issues: data.has_issues,
        forks_count: data.forks_count,
        open_issues_count: data.open_issues_count,
        subscribers_count: data.subscribers_count,
        david_dm_url: 'https://david-dm.org/' + repo.user + '/' + repo.repo
      });

    }, function() {
        def.resolve();
      });
    return def.promise;
  }
};
