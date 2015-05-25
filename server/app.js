var path = require('path'),

  express = require('express'),
  serveStatic = require('serve-static'),
  exphbs = require('express-handlebars'),

  npm = require('./models/npm'),
  github = require('./models/github');



var app = express(),
  env = process.env.NODE_ENV || 'dev';
templatePath = 'distviews';

app.set('googleTrackingId', 'UA-19270982-5')

if (env === 'dev') {
  templatePath = 'views';
  app.set('googleTrackingId', 'UA-19270982-5-NONO')
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
    excludeList: []
  }));

} else {
  console.log('no live reload');
  app.use(serveStatic(path.join(__dirname, 'dist/')));

}

/////////////////
// routes
app.get('/', function(req, res) {
  res.render('index');
});

// search package names
app.get('/api/packages', function(req, res) {
  var q = req.query.q;
  if (!q) {
    return res.json({});
  }
  npm.search(q).then(function(packages) {
    res.json({
      items: packages
    });
  }).fail(function(err) {
    res.json({
      error: err
    });
  });

});

app.get('/api/packages/:packageName', function(req, res) {
  npm.getPackage(req.params.packageName).then(function(packageInfo) {
    res.json(packageInfo);
  }).fail(function(err) {
    res.json({
      error: err
    });
  });
});

app.get('/api/package-stats/:packageName', function(req, res) {
  npm.getPackageStats(req.params.packageName).then(function(packageStats) {
    var gitHubInfo = null,
      repoUrl = packageStats.repositoryUrl || '';
    isGithub = github.isGithub(repoUrl);
    if (isGithub) {
      gitHubInfo = github.getRepoStats(github.parseUrl(repoUrl));
    }
    return [packageStats, gitHubInfo];
  }).spread(function(packageStats, gitHubInfo) {
    try {
      if (gitHubInfo) {
        packageStats.github = gitHubInfo;
      }
    } catch ( e ) {
      console.log(e);
    }
    res.json(packageStats);


  }).fail(function(err) {
    res.json({
      error: err
    });
  });
});

app.get('/api/repos/:owner/:repo', function(req, res) {
  github.getRepoStats({
    user: req.params.owner,
    repo: req.params.repo
  }).then(function(data) {
    res.json(data);
  }, function(err) {
      res.json({
        error: err
      });
    });
});

var npmData = require('./models/npm-data');
app.get('/_refresh', function(req, res) {
  npmData.refresh().then(function(packs) {
    res.json({
      total: packs.length
    });
  })
});

var server = app.listen(process.env.NODE_PORT || 9000, function() {
  console.log('Listening on port %d', server.address().port);
});
