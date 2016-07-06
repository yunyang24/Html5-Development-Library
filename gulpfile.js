/*项目静态文件打包文件*/

var gulp = require('gulp'),
    less = require('gulp-less'),
    base64 = require('gulp-base64'),
    autoprefixer = require('gulp-autoprefixer'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    imagemin = require('gulp-imagemin'),
    clean = require('gulp-rimraf'),
    concat = require('gulp-concat'),
    RevAll = require('gulp-rev-all'),
    revReplace = require('gulp-rev-replace'),
    replace = require("gulp-replace"),
    livereload = require('gulp-livereload');

//Less解析
gulp.task('build-less', ['base64-font'], function () {
    gulp.src('public/' + src + '/less/page/**')
        .pipe(less())
        .pipe(replace('_baseUrl_', config.path.baseUrl))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(minifycss())
        .pipe(gulp.dest('public/' + src + '/css/page'))
        .pipe(gulp.dest('public/' + dist + '/css/page'));
});

// 脚本
gulp.task('build-js', function () {
    if (config.env == 'prod') {
        return gulp.src('public/' + src + '/js/**')
            .pipe(uglify())
            .pipe(gulp.dest('public/' + dist + '/js'));
    }
    return gulp.src('public/' + src + '/js/**')
        .pipe(gulp.dest('public/' + dist + '/js'));
});

// 图片
gulp.task('build-img', function () {
    return gulp.src('public/' + src + '/img/**')
        /*.pipe(imagemin({optimizationLevel: 3, progressive: true, interlaced: true}))*/
        .pipe(gulp.dest('public/' + dist + '/img'));
});

//给所有build文件加戳
gulp.task("revAll", ['build-less', 'build-img', 'build-js'], function () {
    var revAll = new RevAll({hashLength: 12});
    return gulp.src(['public/' + dist + '/js/**', 'public/' + dist + '/css/**', 'public/' + dist + '/img/**'])
        .pipe(revAll.revision())
        .pipe(gulp.dest('public/' + dist))
        .pipe(revAll.manifestFile())
        .pipe(gulp.dest('public/' + dist));
});

//替换静态资源的url
gulp.task("resource-replace", ["revAll"], function () {
    var manifest = gulp.src("./public/" + dist + "/rev-manifest.json");
    return gulp.src("public/" + dist + "/**")
        .pipe(revReplace({manifest: manifest, replaceInExtensions: '.css,.js,.img'}))
        .pipe(gulp.dest("public/" + dist));
});

//替换模版中的url地址
gulp.task("ejs-replace", ["revAll"], function () {
    var manifest = gulp.src("./public/" + dist + "/rev-manifest.json");
    return gulp.src("views/" + src + "/**")
        .pipe(revReplace({manifest: manifest, replaceInExtensions: '.ejs'}))
        .pipe(gulp.dest("views/" + dist));
});

// 清理
gulp.task('clean', function () {
    return gulp.src(['public/' + dist, 'views/' + dist], {read: false}).pipe(clean());
});


// 看守
/*gulp.task('watch', function () {

 // 看守所有.css档
 var less_watcher = gulp.watch('public/'+src+'/less/!**', ['build-less', 'revAll', 'html-replace','ejs-replace','resource-replace']);

 less_watcher.on('change', function (event) {
 console.log(event.path);
 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
 });

 // 看守所有.js档
 var js_watcher = gulp.watch('public/'+src+'/js/!**', ['build-js', 'revAll',  'html-replace','ejs-replace','resource-replace']);

 js_watcher.on('change', function (event) {
 console.log(event.path);
 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
 });

 // 看守所有图片档
 var img_watcher = gulp.watch('public/'+src+'/img/!**', ['build-img', 'revAll', 'html-replace','ejs-replace','resource-replace']);

 img_watcher.on('change', function (event) {
 console.log(event.path);
 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
 });

 var template_watcher = gulp.watch('views/'+src+'/!**', [ 'html-replace','ejs-replace','resource-replace']);

 template_watcher.on('change', function (event) {
 console.log(event.path);
 console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
 });
 // 建立即时重整伺服器
 var server = livereload();

 // 看守所有位在 dist/  目录下的档案，一旦有更动，便进行重整
 gulp.watch(['public/'+dist,'views/'+dist]).on('change', function (file) {
 server.changed(file.path);
 });
 });*/

// 预设任务
gulp.task('default', ['clean'], function () {
    gulp.start('build-less', 'build-js', 'build-img', 'revAll', 'ejs-replace', 'resource-replace');
});
