const {src, dest, watch, series, parallel} = require('gulp');
// Styles
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
// const sourcemaps = require("gulp-sourcemaps");
//General
const browserSync = require("browser-sync").create();
const rename = require('gulp-rename');
const cache = require('gulp-cache');
//Scripts
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
//iMAGES
const imagemin = require('gulp-imagemin');


const paths = {
    input: 'src/',
    output: 'dist/',
    scripts: {
        input: 'src/js/*',
        output: 'dist/'
    },
    styles: {
        input: 'src/sass/*.scss',
        output: 'dist/'
    },
    images: {
        input: 'src/img/*',
        output: 'dist/img/'
    },
    copy: {
        input: 'src/copy/**/*',
        output: 'dist/'
    },
    reload: './dist/'
};

function scriptsBuild() {
    return (
        src(paths.scripts.input)
		// .pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['@babel/preset-env']
        }))
        .pipe(uglify())
		.pipe(concat('all.js'))
		// .pipe(sourcemaps.write('.'))
		.pipe(dest(paths.scripts.output))
    );
}

function buildStyles() {
    return (
            src(paths.styles.input)
            // .pipe(sourcemaps.init())
            .pipe(sass({
                outputStyle: 'expanded',
                sourceComments: true
            }))
            .pipe(autoprefixer({
                browsers: ['last 2 version', '> 0.25%'],
                cascade: true,
                remove: true
            }))
            .pipe(cssnano({
                discardComments: {
                    removeAll: true
                }
            }))
            .pipe(rename({suffix: '.min'}))
            // .pipe(sourcemaps.write())
            .pipe(dest(paths.styles.output))
            .pipe(browserSync.stream())
    );
}

function imgCompress() {
    return (
        src(paths.images.input)
        .pipe(cache(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ])))
        
        .pipe(dest(paths.images.output))
    );
}

function build () {
	return src(paths.copy.input)
		.pipe(dest(paths.copy.output));
};

function startServer (done) {
	browserSync.init({
		server: {
			baseDir: paths.reload
		}
	});
	done();
};

function reloadBrowser(done) {
	browserSync.reload();
	done();
};

function watchSource(done) {
	watch(paths.input, series(exports.default, reloadBrowser));
	done();
};

exports.default = series(
	parallel(
        buildStyles,
        scriptsBuild,
        imgCompress,
		build
	)
);


exports.watch = series(
	exports.default,
	startServer,
	watchSource
);