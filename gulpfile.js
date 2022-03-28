const { src, watch, dest, series } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass')(require('sass'));
const uglify = require('gulp-uglify-es').default;
const fileInclude = require('gulp-file-include');
const concat = require('gulp-concat');
const autoprefixer = require('gulp-autoprefixer');
const formatHtml = require('gulp-format-html');

const srcFolder = './src';
const buildFolder = './build';
const paths = {
	srcScss: `${srcFolder}/scss/**/*.scss`,
	buildCss: `${buildFolder}/css`,
	srcJs: `${srcFolder}/js/**/*.js`,
	buildJs: `${buildFolder}/js`,
	srcImage: `${srcFolder}/img`,
	buildImage: `${buildFolder}/img`,
	srcFonts: `${srcFolder}/fonts`,
	buildFonts: `${buildFolder}/fonts`,
	srcPartialsFolder: `${srcFolder}/partials`
};

function styles() {
	return src(paths.srcScss)
		.pipe(sass({
			outputStyle: 'compressed',
		}))
		.pipe(autoprefixer({
			grid: 'autoplace',
			cascade: false,
			overrideBrowserslist: ["last 5 versions"]
		}))
		.pipe(concat('style.min.css'))
		.pipe(dest(paths.buildCss))
		.pipe(browserSync.stream())
};

function scripts() {
	return src(paths.srcJs)
		.pipe(uglify())
		.pipe(dest(paths.buildJs))
		.pipe(browserSync.stream())
};

function cleanDist() {
	return del(buildFolder)
};

function htmlInclude() {
	return src([`${srcFolder}/*.html`])
		.pipe(fileInclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(formatHtml({
			indent_with_tabs: true,
			indent_size: 2
		}))
		.pipe(dest(buildFolder))
		.pipe(browserSync.stream())
};

function watchFiles() {
	browserSync.init({
		server: {
			baseDir: `${buildFolder}`
		},
		port: 3002
	});
	watch(paths.srcScss, styles);
	watch(paths.srcJs, scripts);
	watch(`${paths.srcImage}/**/**.{jpg,jpeg,png,svg}`, images);
	watch(`${paths.srcPartialsFolder}/*.html`, htmlInclude);
	watch(`${srcFolder}/*.html`, htmlInclude);
};

function images() {
	return src(`${paths.srcImage}/**.{jpg,jpeg,png,svg}`)
		.pipe(dest(paths.buildImage))
}

function fonts() {
	return src(`${paths.srcFonts}/**.{ttf, woff, woff2}`)
		.pipe(dest(paths.buildFonts))
}

exports.styles = styles;
exports.htmlInclude = htmlInclude;
exports.scripts = scripts;
exports.cleanDist = cleanDist;
exports.watchFiles = watchFiles;
exports.images = images;
exports.fonts = fonts;

exports.default = series(cleanDist, htmlInclude, styles, scripts, images, fonts, watchFiles);