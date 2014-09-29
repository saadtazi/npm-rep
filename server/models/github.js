var q = require('q'),
    GithubApi = require('github');

var github = new GithubApi({
    // required
    version: '3.0.0',
    debug: true
});


module.exports = {
  parseUrl: function (url) {
    var urlInfo = url.replace('.git', '').split('/').slice(-2);
    return {
      user: urlInfo[0],
      repo: urlInfo[1]
    }
  },
  getRepo: function (repo) {
    var repoDef = q.defer();
    github.repos.get(repo, function(err, res) {
      if (err) { repoDef.reject(err); return; }
      repoDef.resolve(res);
    });
    return repoDef.promise;
  },

  getRepoStats: function (repo) {
    //   - fork: false (show only if true)
    //   - created_at
    //   - updated_at
    //   - pushed_at
    //   - stargazers_count
    //   - watchers_count
    //   - has_issues (show if false)
    //   - forks_count
    //   - open_issues_count
    //   - subscribers_count
    return this.getRepo(repo).then(function (data) {
      return {
        is_fork:          data.fork,
        created_at:       data.create_at,
        updated_at:       data.updated_at,
        pushed_at:        data.pushed_at,
        stargazers_count: data.stargazers_count,
        watchers_count:   data.watchers_count,
        has_issues:       data.has_issues,
        forks_count:      data.forks_count,
        open_issues_count: data.open_issues_count,
        subscribers_count: data.subscribers_count
      };
    });
  }
};
