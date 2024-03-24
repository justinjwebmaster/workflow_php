var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var imagemin = require('gulp-imagemin');
var changed = require('gulp-changed');
var clean = require('gulp-clean');
var livereload = require('gulp-livereload');
var connect = require('gulp-connect-php');
var browserSync = require('browser-sync').create();
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var concat = require('gulp-concat');
var tailwindcss = require('tailwindcss');

var paths = {
    src: 'src/',
    dist: 'dist/'
};

gulp.task('clean', function () {
    return gulp.src(paths.dist, {read: false, allowEmpty: true})
        .pipe(clean());
});



gulp.task('styles', function () {
    return gulp.src(paths.src + 'scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([tailwindcss(), autoprefixer(), cssnano()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist + 'css'))
        .pipe(browserSync.stream());
});

gulp.task('scripts', function () {
    return gulp.src(paths.src + 'js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist + 'js'))
        .pipe(browserSync.stream());
});

gulp.task('images', function () {
    return gulp.src(paths.src + 'img/**/*')
        .pipe(changed(paths.dist + 'img'))
        .pipe(imagemin())
        .pipe(gulp.dest(paths.dist + 'img'))
        .pipe(browserSync.stream());
});

gulp.task('php', function () {
    return gulp.src(['src/*.php', 'src/**/*.php'], { base: 'src' })
        .pipe(changed(paths.dist))
        .pipe(gulp.dest(paths.dist))
        .on('end', function() { browserSync.reload(); }); // Use browserSync.reload() instead of browserSync.stream()
});

gulp.task('connect-sync', function () {
    connect.server({}, function (){
        browserSync.init({
            proxy: 'https://devourly.local:8890/'
        });
    });

    gulp.watch(paths.src + '**/*', gulp.series('clean', 'styles', 'scripts', 'images', 'php')).on('change', function() { browserSync.reload(); });
});

gulp.task('styles-dev', function () {
    return gulp.src(paths.src + 'scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([tailwindcss(), autoprefixer()]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist + 'css/'))
        .pipe(browserSync.stream());
});

gulp.task('scripts-dev', function () {
    return gulp.src(paths.src + 'js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist + 'js'))
        .pipe(browserSync.stream());
});

gulp.task('serve', gulp.series('clean', 'styles-dev', 'scripts-dev', 'images', 'php', 'connect-sync'));

gulp.task('build', gulp.series('clean', 'styles', 'scripts', 'images', 'php'));

gulp.task('default', gulp.series('serve'));