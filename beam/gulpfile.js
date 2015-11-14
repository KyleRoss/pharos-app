var gulp = require('gulp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    minifyCss = require('gulp-minify-css'),
    rename = require('gulp-rename');

gulp.task('sass', function () {
    gulp.src('www/scss/**/*.scss', { base: './' })
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) {
            path.dirname = path.dirname.replace('scss', 'css'),
            path.basename += '.min';
        }))
        .pipe(minifyCss({compatibility: 'ie8'}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest(''))
});

gulp.task('watch', function () {
    gulp.watch('www/scss/**/*.scss', ['sass']);
});