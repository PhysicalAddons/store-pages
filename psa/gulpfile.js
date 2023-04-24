var destroot = "public/";
var gulp = require("gulp"),
  sass = require("gulp-sass")(require("sass")),
  twig = require("gulp-twig"),
  browserSync = require("browser-sync").create();

gulp.task("css", function () {
  return gulp
    .src("src/style.scss")
    .pipe(
      sass({
        // outputStyle: 'compressed'
      }).on("error", sass.logError)
    )
    .pipe(gulp.dest(destroot + "assets/css/"))
    .pipe(browserSync.stream());
});

gulp.task("compile", function (done) {
  return gulp
    .src("src/index.twig")
    .pipe(twig({ data: {} }))
    .pipe(gulp.dest(destroot))
    .pipe(browserSync.stream());
  done();
});

gulp.task("browserSync", function () {
  browserSync.init({
    open: false,
    server: {
      baseDir: destroot,
    },
  });
});


gulp.task("watch", function () {
  gulp.watch("./**/*.scss", gulp.series("css"));
  gulp.watch("./**/*.twig", gulp.series("compile"));
});

gulp.task("default", gulp.parallel("browserSync", "compile", "watch", "css"));
