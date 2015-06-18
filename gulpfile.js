var gulp = require('gulp');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat');
var js2coffee = require('gulp-js2coffee');
var streamqueue = require('streamqueue');

function swallowError(error) {
    console.log(error.toString());
    this.emit('end');
}

gulp.task('build:src', function () {

	var pbMap = gulp.src('src/protobuf-map.coffee');

	var pbDecode = gulp.src('src/protobuf-decode.js')

					   .pipe(js2coffee().on('error', swallowError));

	var base64 = gulp.src('src/base64_shim.js')

		.pipe(js2coffee().on('error', swallowError));

	return streamqueue({ objectMode: true }, pbDecode, base64, pbMap)

		.pipe(concat('jsbuf.js'))

		.pipe(coffee())

		.on('error', swallowError)

		.pipe(gulp.dest('build'));
});


gulp.task('build:test', function () {

	return gulp.src('test/*.coffee')
	
			.pipe(coffee({
				bare: true
			}))
			
			.on('error',swallowError)
			
			.pipe(concat('spec-all.js'))
			
			.pipe(gulp.dest('test'));
			
});


gulp.task('watch', function () {
	gulp.watch(['src/protobuf-decode.js', 'src/protobuf-map.coffee'], ['build:src']);
	gulp.watch('test/*.coffee', ['build:test']);
});