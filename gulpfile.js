const gulp = require('gulp');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const terser = require('gulp-terser');
const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const htmlmin = require('gulp-html-minifier-terser');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');

const destDir = 'dist';

// Tarefa para limpar o diretório dist
gulp.task('clean', function () {
  return gulp.src(destDir, { read: false }).pipe(clean());
});

// Tarefa para processar CSS
gulp.task('css', function () {
  return gulp.src('src/**/*.css')
    .pipe(postcss([tailwindcss, autoprefixer, cssnano]))
    .pipe(gulp.dest(destDir))
    .pipe(browserSync.stream());
});

// Tarefa para processar CSS no desenvolvimento (sem minificação)
gulp.task('css-dev', function () {
  return gulp.src('src/**/*.css')
    .pipe(postcss([tailwindcss, autoprefixer]))
    .pipe(gulp.dest(destDir))
    .pipe(browserSync.stream());
});

// Tarefa para minificar JavaScript
gulp.task('js', function () {
  return gulp.src('src/**/*.js')
    .pipe(terser()) // minifica o JavaScript
    .pipe(gulp.dest(destDir));
});

// Tarefa para processar JavaScript no desenvolvimento (sem minificação)
gulp.task('js-dev', function () {
  return gulp.src('src/**/*.js')
    .pipe(gulp.dest(destDir));
});

// Tarefa para minificar HTML
gulp.task('html', function () {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
    .pipe(gulp.dest(destDir));
});

// Tarefa para processar HTML no desenvolvimento (sem minificação)
gulp.task('html-dev', function () {
  return gulp.src('src/**/*.html')
    .pipe(gulp.dest(destDir));
});

// Tarefa para copiar ícones e imagens
gulp.task('assets', function () {
  return gulp.src('src/assets/**/*', { encoding: false })
    .pipe(gulp.dest('dist/assets'));
});

// Tarefa para copiar manifest.json
gulp.task('manifest', function () {
  return gulp.src('src/manifest.json')
    .pipe(gulp.dest(destDir));
});

// Tarefa para observar mudanças nos arquivos durante o desenvolvimento
gulp.task('watch', function () {
  browserSync.init({
    server: {
      baseDir: destDir,
    },
    index: "popup.html",
    open: false, // Não abre o navegador automaticamente
    ghostMode: false, // Desativa a sincronização entre dispositivos
    reloadDebounce: 400, // Ajusta o debounce do reload
  });
  gulp.watch('./src/**/*.{html,js,css}', gulp.series('css-dev')).on('change', browserSync.reload);
  gulp.watch('src/**/*.js', gulp.series('js-dev')).on('change', browserSync.reload);
  gulp.watch('src/**/*.html', gulp.series('html-dev')).on('change', browserSync.reload);
  gulp.watch('src/assets/**/*', gulp.series('assets')).on('change', browserSync.reload);
  gulp.watch('src/manifest.json', gulp.series('manifest')).on('change', browserSync.reload);
});

// Tarefa de desenvolvimento que inclui servidor e observação de arquivos
gulp.task('watch', gulp.series('css-dev', 'js-dev', 'html-dev', 'assets', 'manifest', 'watch'));

// Tarefa de desenvolvimento que apenas processa os arquivos
gulp.task('dev', gulp.parallel('css-dev', 'js-dev', 'html-dev', 'assets', 'manifest'));

// Tarefa de build que apenas processa os arquivos
gulp.task('build', gulp.series('clean', 'css', 'js', 'html', 'assets', 'manifest'));