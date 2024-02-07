var destroot = "public/";
var gulp = require("gulp"),
  sass = require("gulp-sass")(require("sass")),
  twig = require("gulp-twig"),
  responsive = require("gulp-responsive"),
  // imagemin  = require("gulp-imagemin"),
  shell = require('gulp-shell'),
  glob = require('glob'),
  path = require('path'),
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

// gulp.task('convert-to-webp', done => {
//   const normal = glob.sync('src/assets/benefits/normal/*.jpg');
//   const wide = glob.sync('src/assets/benefits/wide/*.jpg');
//   const folders = [normal, wide]
//   folders.forEach(folder => {
//     folder.forEach(file => {
//       const outputPath = path.join(
//         path.dirname(file),
//         path.basename(file, path.extname(file)) + '.webp'
//       );
//       shell.task([
//         `cwebp -q 100 -losslessd ${file} -o ${outputPath}`
//       ])();
//     });
//   })
//   done();
// });

gulp.task("resize-jpg", function () {
  return gulp
    .src(["src/assets/benefits/normal/*.jpg", "src/assets/benefits/wide/*.jpg"]) // Include both selectors
    .pipe(
      responsive(
        {
          "**/*.jpg": [ // Selector for normal .jpg
            { width: 356 },
            { width: 712, rename: { suffix: "x2" } },
          ],
          "**/*.jpg": [ // Selector for wide .jpg
            { width: 724 },
            { width: 1448, rename: { suffix: "x2" } },
          ],
        },
        {
          // Global configuration for all images
          quality: 85,
          progressive: true,
          withMetadata: false,
          withoutEnlargement: false, // This will generate image also if it is smaller than needed image
        }
      )
    )
    .pipe(gulp.dest(destroot + "assets/images/benefits"))
});

// gulp.task("resize-webp", function () {
//   return gulp
//     .src(["src/assets/benefits/normal/*.webp", "src/assets/benefits/wide/*.webp"]) // Include both selectors
//     .pipe(
//       responsive(
//         {
//           "**/*.webp": [ // Selector for normal .jpg
//             { width: 356 },
//             { width: 712, rename: { suffix: "x2" } },
//           ],
//           "**/*.webp": [ // Selector for wide .jpg
//             { width: 724 },
//             { width: 1448, rename: { suffix: "x2" } },
//           ],
//         },
//         {
//           withMetadata: false,
//           withoutEnlargement: false, // This will generate image also if it is smaller than needed image
//         }
//       )
//     )
//     .pipe(gulp.dest(destroot + "assets/images/benefits"))
// });

gulp.task('copy-videos', function() {
  return gulp.src([
      "src/assets/benefits/normal/*.mp4",
      "src/assets/benefits/normal/*.webm",
      "src/assets/benefits/wide/*.mp4",
      "src/assets/benefits/wide/*.webm"
    ]).pipe(gulp.dest(destroot + "assets/images/benefits"));
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
gulp.task("build", gulp.parallel("compile", "css"));
gulp.task("generate-media", gulp.parallel("resize-jpg", "copy-videos"));

