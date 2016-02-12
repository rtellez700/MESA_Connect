'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var connect = require('gulp-connect'); //Runs a local dev server
var open = require('gulp-open'); //Open a URL in a web browser
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var lint = require('gulp-eslint');


var config = {
  port: 8001,
  devBaseUrl: 'http://localhost',
  paths: {
    html: './src/*.html',
    js: './src/**/*.js',
    css: [
      'node_modules/bootstrap/dist/css/bootstrap.min.css',
      'node_modules/bootstrap/dist/css/bootstrap-theme.min.css'
    ],
    sass: './src/main.scss',
    mainJS: './src/main.js',
    dist: './dist',
  }
};

//Start local dev server
gulp.task('connect', function(){
  connect.server({
    root: ['dist'],
    port: config.port,
    base: config.devBaseUrl,
    livereload: true,
  });
});

gulp.task('open', ['connect'], function(){
  gulp.src('dist/index.html')
  .pipe(open({uri: config.devBaseUrl + ':' + config.port + '/',}));
});

gulp.task('html', function(){
  gulp.src(config.paths.html)
    .pipe(gulp.dest(config.paths.dist))
    .pipe(connect.reload());
});

gulp.task('js', function(){
  browserify(config.paths.mainJS)
    .transform(reactify)
    .bundle()
    .on('error', console.error.bind(console))
    .pipe(source('bundle.js'))
    .pipe(gulp.dest(config.paths.dist + '/scripts'))
    .pipe(connect.reload());
});

gulp.task('css', function(){
  gulp.src(config.paths.css)
    .pipe(concat('bundle.css'))
    .pipe(gulp.dest(config.paths.dist + '/css'));
});

// TODO: minify
gulp.task('sass',function(){
  gulp.src(config.paths.sass)
    .pipe(sass({
      includePaths: ['./src','node_modules/bootstrap-sass/assets/stylesheets/']
    }))
    // .pipe(sass().on('error',sass.logError))
    .pipe(concat('app_scss.css'))
    .pipe(gulp.dest(config.paths.dist + '/css'));
  });

gulp.task('lint', function(){
  return gulp.src(config.paths.js)
          .pipe(lint({config: '.eslintrc'}))
          .pipe(lint.format());
});

gulp.task('watch', function(){
  gulp.watch(config.paths.html, ['html']);
  gulp.watch(config.paths.js, ['js', 'lint']);
  gulp.watch(config.paths.sass,['sass']);
});

gulp.task('default', ['html', 'js', 'css','sass', 'lint', 'open', 'watch']);
