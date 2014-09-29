var path = require('path'),

    express = require('express'),
    serveStatic = require('serve-static'),
    exphbs  = require('express-handlebars'),

    npm = require('./models/npm'),
    github = require('./models/github');



var app = express(),
    env = process.env.NODE_ENV || 'dev';
    templatePath = 'distviews';

if (env === 'dev') {
  templatePath = 'views';
}

app.engine('.hbs', exphbs({
  extname: '.hbs',
  defaultLayout: 'main',
  layoutsDir: path.join(__dirname, templatePath + '/layouts/'),
  partialsDir: path.join(__dirname, templatePath + '/partials/')
}));

app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, './' + templatePath + '/'));


if (env === 'dev') {
  app.use(serveStatic(path.join(__dirname, 'public/')));
  app.use(serveStatic(path.join(__dirname, '.tmp/')));
  console.log('live reload!');
  app.use(require('connect-livereload')({
    port: 35729,
    // src: '/bower_components/livereload/dist/livereload.js?snipver=1',
    excludeList: []
  }));

} else {
  console.log('no live reload');
  app.use(serveStatic(path.join(__dirname, 'dist/')));

}

/////////////////
// routes
app.get('/', function(req, res){
  res.render('index');
});

app.get('/api/packages/search', function (req, res){
  var q = req.query.q;
  npm.search(q).then(
    function (packages) {
      res.json({items: packages});
    },
    function (err) {
      res.json({error: err});
    });

});

app.get('/api/packages/:packageName', function (req, res){
  npm.getPackage(req.params.packageName).then(
    function (packageInfo) {
      res.json(packageInfo);
    },
    function (err) {
      res.json({error: err});
    });
});

app.get('/api/packages/:packageName/stats', function (req, res){
  npm.getPackageStats(req.params.packageName).then(
    function (packageStats) {
      console.log(promise.inspect());
      console.log('ici packageStats');
      res.json(packageStats);
    },
    function (err) {
      console.log(promise.inspect());
      res.json({error: err});
    });
});

app.get('/api/repos/:owner/:repo/stats', function (req, res){
  github.getRepoStats({
    user: req.params.owner,
    repo: req.params.repo
  }).then(
    function (data) {
      res.json(data);
    },
    function (err) {
      console.log(promise.inspect());
      res.json({error: err});
    });
});

// https://registry.npmjs.org/fakr
//   - number of versions
//   - time.versions[last] // use semver or dist-tags.latest
//   - repo: if repo.url contains github.com, ask for github repo info

// https://api.npmjs.org/downloads/point/2014-09-01:2014-09-10/fakr
//   - last week download
// https://developer.github.com/v3/repos/#get
//   ex: https://api.github.com/repos/saadtazi/fakr-node
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

// https://api.github.com/repos/saadtazi/firefox-profile-js/contributors


var server = app.listen(9000, function() {
    console.log('Listening on port %d', server.address().port);
});
