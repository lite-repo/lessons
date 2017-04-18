var gulp = require('gulp');
//require gulp-sass plugin
var sass = require('gulp-sass');

gulp.task('hello', function(){
	//do 
	console.log('Hello world');
});

gulp.task('sass', function(){
	return gulp.src('app/scss/styles.scss')
		.pipe(sass()) //using gulp-sass
		.pipe(gulp.dest('app/css'))
});

