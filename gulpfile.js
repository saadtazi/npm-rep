'use strict';
// generated on 2014-09-27 using generator-gulp-webapp 0.1.0

var gulp = require('gulp');

// load plugins
var $ = require('gulp-load-plugins')();

gulp.task('styles', function () {
    // return gulp.src('server/public/styles/main.scss')
    //     .pipe($.rubySass({
    //         style: 'expanded',
    //         precision: 10
    //     }))
    return gulp.src('server/public/styles/main.less')
        .pipe($.less())
        .pipe($.autoprefixer('last 1 version'))
        .pipe(gulp.dest('server/.tmp/styles'))
        .pipe($.size());
});

gulp.task('templates', function () {
    return gulp.src('server/public/templates/**/*.hbs')
        .pipe($.handlebars())
        .pipe($.defineModule('plain'))
        .pipe($.declare({
            namespace: 'MyApp.templates' // change this to whatever you want
        }))
        .pipe(gulp.dest('server/.tmp/templates'));
});

gulp.task('scripts', function () {
    return gulp.src('server/public/scripts/**/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter(require('jshint-stylish')))
        .pipe($.size());
});

gulp.task('html', ['styles', 'templates', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js');
    var cssFilter = $.filter('**/*.css');

    return gulp.src('server/**/*.hbs', { base: 'server'})
        .pipe($.useref.assets({searchPath: '{server/.tmp,server/public}'}))
        .pipe(jsFilter)
        .pipe($.uglify())
        .pipe(jsFilter.restore())
        .pipe(cssFilter)
        .pipe($.csso())
        .pipe(cssFilter.restore())
        .pipe($.useref.restore())
        .pipe($.useref())
        .pipe(gulp.dest('server/dist'))
        .pipe($.size());
});

gulp.task('distviews', function () {
  gulp.src('server/dist/views/**/*')
      .pipe(gulp.dest('server/distviews'))
      .pipe($.size());;
});

gulp.task('images', function () {
    return gulp.src('server/public/images/**/*')
        .pipe($.cache($.imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('server/dist/images'))
        .pipe($.size());
});

gulp.task('fonts', function () {
    return $.bowerFiles()
        .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
        .pipe($.flatten())
        .pipe(gulp.dest('server/dist/fonts'))
        .pipe($.size());
});

gulp.task('extras', function () {
    return gulp.src(['server/public/*.*', '!server/public/*.html'], { dot: true })
        .pipe(gulp.dest('server/dist'));
});

gulp.task('clean', function () {
    return gulp.src(['server/.tmp', 'server/dist'], { read: false }).pipe($.clean());
});

gulp.task('build', ['html', 'distviews', 'images', 'fonts', 'extras']);

gulp.task('default', ['clean'], function () {
    gulp.start('build');
});

gulp.task('connect', function () {
    require('./server/app');
    // var connect = require('connect');
    // var app = connect()
    //     .use(require('connect-livereload')({ port: 35729 }))
    //     .use(connect.static('server/public'))
    //     .use(connect.static('server/.tmp'))
    //     .use(connect.directory('server/public'));

    // require('http').createServer(app)
    //     .listen(9000)
    //     .on('listening', function () {
    //         console.log('Started connect web server on http://localhost:9000');
    //     });
});

gulp.task('serve', ['connect', 'styles', 'templates'], function () {
    require('opn')('http://localhost:9000');
});

// inject bower components
gulp.task('wiredep', function () {
    var wiredep = require('wiredep').stream;

    // gulp.src('server/public/styles/*.scss')
    gulp.src('server/public/styles/*.less')
        .pipe(wiredep({
            directory: 'server/public/bower_components'
        }))
        .pipe(gulp.dest('server/public/styles'));

    gulp.src('server/templates/*.hbs')
        .pipe(wiredep({
            directory: 'server/public/bower_components',
            exclude: ['bootstrap']
        }))
        .pipe(gulp.dest('server/public'));
});

gulp.task('watch', ['connect', 'serve'], function () {
    var server = $.livereload();

    // watch for changes

    gulp.watch([
        'server/**/*.js',
        'server/.tmp/styles/**/*.css',
        '.tmp/templates/**/*.js',
        'server/public/scripts/**/*.js',
        'server/public/images/**/*'
    ]).on('change', function (file) {
        server.changed(file.path);
    });

    // gulp.watch('server/public/styles/**/*.scss', ['styles']);
    gulp.watch('server/{templates,views}/**/*.hbs', ['html', 'distviews']);
    gulp.watch('server/public/styles/**/*.less', ['styles']);
    gulp.watch('server/public/scripts/**/*.js', ['scripts']);
    gulp.watch('server/public/images/**/*', ['images']);
    gulp.watch('bower.json', ['wiredep']);
});
