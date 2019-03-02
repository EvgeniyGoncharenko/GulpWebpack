"use strict";
//---------------------------------
const projectName = 'Template.loc';
//---------------------------------
const gulp = require('gulp');
//const include = require('gulp-include')
const gulpIf = require('gulp-if');
const less = require('gulp-less');
const autoprefixer = require('gulp-autoprefixer');
const csso = require('gulp-csso');
const sourcemap = require('gulp-sourcemaps');
const bs = require('browser-sync').create();
const plumber = require('gulp-plumber');
const debug = require('gulp-debug');
const mainBowerFiles = require('main-bower-files');
const flatten = require('gulp-flatten');
const imagemin = require('gulp-imagemin');
const svgSymbols = require('gulp-svg-symbols');
const svgmin = require('gulp-svgmin');
const del = require('del');
const newer = require('gulp-newer');
//const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const gutil = require("gulp-util");
//const webpackStream  = require('webpack-stream');
const webpack = require('webpack');

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

//----------------------------------------------------------------
//HTML TASK
//----------------------------------------------------------------

gulp.task('html', function () {
    return gulp.src('./src/*.html',{since:gulp.lastRun('html')})
        .pipe(plumber())
        .pipe(debug({title:'HTML'}))
        //.pipe(include())
        .pipe(gulp.dest('./build'))
});

//----------------------------------------------------------------
//CSS_min_for_libs css files
//----------------------------------------------------------------

gulp.task('cssmin', function () {
    return gulp.src('./src/cssForMin/*.css')
        .pipe(plumber())
        .pipe(csso({restructure: false}))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('./build/css'))
});


//----------------------------------------------------------------
//CSS TASK
//----------------------------------------------------------------

gulp.task('css', function () {
    return gulp.src('./src/precss/styles.less')
        .pipe(plumber())
        .pipe(gulpIf(isDevelopment, sourcemap.init()))
        .pipe(less())
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(csso({restructure: false}))
       .pipe(gulpIf(isDevelopment, sourcemap.write()))
        .pipe(gulp.dest('./build/css'))
});

//----------------------------------------------------------------
//JS WEBPACK TASK
//----------------------------------------------------------------

 gulp.task('webpack', function(done){

   let config = './webpack.config.js';

    webpack(require(config)).run(onBuild(done));

    function onBuild(done) {
        return function(err, stats) {
            if (err) {
                gutil.log('Error', err);
                if (done) {
                    done();
                }
            } else {
                Object.keys(stats.compilation.assets).forEach(function(key) {
                    gutil.log('Webpack: output ', gutil.colors.green(key));
                });
                gutil.log('Webpack: ', gutil.colors.blue('finished ', stats.compilation.name));
                if (done) {
                    done();
                }
            }
        }
    };
  });

//----------------------------------------------------------------
//LIBS TASK
//----------------------------------------------------------------

gulp.task('libs', function () {
    return gulp.src(mainBowerFiles({
        'overrides' : {
            'jquery': {
                'main': 'dist/jquery.min.js'
            },
            'svg4everybody': {
                'main': 'dist/svg4everybody.min.js'
            },
            'slick-carousel': {
                'main': [
                    'slick/slick.js',
                    'slick/slick.css',
                    'slick/slick-theme.css'
                ]
            },
            'photoswipe': {
                'main': [
                    'dist/photoswipe.min.js',
                    'dist/photoswipe.css',
                    'dist/photoswipe-ui-default.min.js',
                    'dist/default-skin/default-skin.css',
                    'dist/default-skin/default-skin.png',
                    'dist/default-skin/default-skin.svg',
                    'dist/default-skin/preloader.gif'
                ]
            }
        }
    }), {base:'./src/libs'})
        .pipe(newer('build'))
        .pipe(flatten({includeParents : 1}))
        .pipe(gulp.dest('./build/libs'))
});

//----------------------------------------------------------------
//IMAGE TASK
//----------------------------------------------------------------

gulp.task('img', function () {
    return gulp.src('src/img/**/*.{jpg,png,gif}', {base: './src'})
        .pipe(newer('build'))
        .pipe(imagemin())
        .pipe(gulp.dest('./build'))
});

//----------------------------------------------------------------
//SVG SPRITE ICONS TASK
//----------------------------------------------------------------

gulp.task('svg:icon', function () {
    return gulp.src('./src/svg/icon/*svg')
        .pipe(newer('build'))
        .pipe(svgmin({
            plugin: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(svgSymbols({
            templates:['default-svg', 'default-demo']
        }))
        .pipe(gulp.dest('./build/svg/icon'))
});

//----------------------------------------------------------------
//SVG TASK
//----------------------------------------------------------------

gulp.task('svg', function () {
    return gulp.src('./src/svg/*svg')
        .pipe(newer('build'))
        .pipe(svgmin({
            plugin: [
                {removeEditorsNSData: true},
                {removeTitle: true}
            ]
        }))
        .pipe(gulp.dest('./build/svg'))
});

//----------------------------------------------------------------
//FONT TASK
//----------------------------------------------------------------

gulp.task('fonts', function () {
    return gulp.src('./src/fonts/**/*.*')
        .pipe(newer('build'))
        .pipe(gulp.dest('./build/fonts'))
});

//----------------------------------------------------------------
//BROWSER-SYNC TASK
//----------------------------------------------------------------

gulp.task('server', function () {
    bs.init({
        proxy: projectName,
        notify: false
    })
});

//----------------------------------------------------------------
//CLEAN 'BULD' TASK
//----------------------------------------------------------------

gulp.task('clean', function () {
    return del('build/*');
});

//----------------------------------------------------------------
//WATCHERS 
//----------------------------------------------------------------

gulp.task('watchers', function () {
    gulp.watch('./src/*.html', gulp.series('html'));
    gulp.watch('./src/precss/*.less', gulp.series('css'));
    gulp.watch('./src/js/*.js').on('change', gulp.series('webpack'));
    //gulp.watch('./src/templates*.html', gulp.series('htmlTemplates'));
    gulp.watch('./build/*.html').on('change', bs.reload);
    gulp.watch('./build/css/styles.css').on('change', bs.reload);
    gulp.watch('./build/js/*.js').on('change', bs.reload);
    gulp.watch('./src/img/**/*.{jpg,png,gif}', gulp.series('img'));
    gulp.watch('./src/svg/icon/*svg', gulp.series('svg:icon'));
    gulp.watch('./src/svg/*svg', gulp.series('svg'));
    gulp.watch('./src/fonts/**/*.*', gulp.series('fonts'));
 
});

//-----------------------------------PRODUCTION----------------------------------------------------------------------
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'webpack', 'img', 'fonts', 'svg', 'svg:icon')));
//-------------------------------------------------------------------------------------------------------------------

//-----------------------------------DEVELOPMENT-------------------------------------------
gulp.task('dev', gulp.series('build', gulp.parallel('watchers', 'server'))); 
//-----------------------------------------------------------------------------------------