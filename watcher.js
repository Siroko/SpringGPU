/**
 * Created by siroko on 6/22/15.
 */
var watchify = require('watchify');
var browserify = require('browserify');
var stringify = require('stringify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

var b = browserify('./app/app.js', {
    debug: true,
    cache: {},
    packageCache: {}
})
.transform(stringify(['.glsl']));

var w = watchify(b);
w.on('update', bundle);

function bundle( e ) {
    if( e ){
        for (var i = 0; i < e.length; i++) {
            console.log('File changed', e[i]);
        }
        console.log(e.length, 'Files Built into /public/js/bundle.js');
        console.log('Watching for .JS changes....');
    }

    return b.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('bundle.js'))
        // optional, remove if you don't need to buffer file contents
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        // Add transformation tasks to the pipeline here.
        //.pipe(uglify({
        //    compress: {
        //        drop_debugger: false
        //    }
        //}))
        .pipe(sourcemaps.write('./')) // writes .map file

        .pipe(gulp.dest('./public/js'));
}

bundle();
console.log('Watching for .JS changes....');