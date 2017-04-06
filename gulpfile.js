
// *gulpfile.js*

// Import gulp packages
var gulp = require('gulp');
var gutil = require('gulp-util');
var rename = require('gulp-rename');
var nodemon = require('gulp-nodemon');
var docco = require('gulp-docco');
var scsslint = require('gulp-scss-lint');
var  ts = require('gulp-typescript');
var path = require('path');
var del = require('del');

var merge2 = require('merge2');
var dts_generator = require('dts-generator');
var run_sequence = require('run-sequence');
var gulp_concat = require('gulp-concat');
var gulp_sourcemaps = require('gulp-sourcemaps');


//import globby from 'globby';

let sourcemapsInline = true;



var sourcemapsConfig = null;
if(!sourcemapsInline) //if not inline, then write in file
{
    sourcemapsConfig = '.';
}

// pull in the project TypeScript config
var tsProject = ts.createProject('tsconfig.json');
var JSON_FILES = ['src/*.json', 'src/**/*.json'];

// Define `JavaScript` files to watch/ignore
var jsGlob = ['src/**/*.js', '!{node_modules,node_modules/**}', '!{docs,doc/**}',
  '!{lib,lib/**}', '!{coverage,coverage/**}', '!src/{res,res/**}','!src/**/*.spec.ts',
  '!config/env.conf.js'];

// Define `TypeScript` files to watch/ignore
var tsGlob = ['src/**/*.ts', '!{node_modules,node_modules/**}', '!{docs,doc/**}',
  '!{lib,lib/**}', '!{coverage,coverage/**}', '!src/{res,res/**}'];

// Define `Sass` files to watch/ignore
var scssGlob = ['**/*.scss', '!{node_modules,node_modules/**}',
  '!{lib,lib/**}', '!{docs,doc/**}', '!{coverage,coverage/**}', '!src/{res,res/**}'];

// Create the default task and have it clear out all existing
// documentation; watch all neccessary files for automatic
// documentation generation as well as linting all `sass` styles.
gulp.task('default', ['clean:docs',
                      'watch:docs',
                      'watch:sass',
                      'watch:scripts']);

// Watch `Sass` files for changes and lint
gulp.task('watch:sass', () => {

  gulp.watch(scssGlob, function (event) {
    return gulp.src(event.path)
      .pipe(scsslint());
  });
});

gulp.task('build:docs', () => {

  // Take a file `glob` pattern and a file extension matching
  // the extension of the files you are trying to generate
  // documentation for
  function generateDocs(fileSrc, ext) {

    console.log(ext);

    if(ext == '') {

      throw new Error('Extension must be pa ssed in for documentation to be generated properly!')
    }
    return gulp.src(fileSrc)
      .pipe(docco())
      .pipe(gulp.dest(`docs/${ext}`));
  }

  generateDocs(jsGlob, '.js');

  generateDocs(tsGlob, '.ts');

  generateDocs(scssGlob, '.scss');

});

//convert typescript to javascript
gulp.task('watch:scripts', () => {
   gulp.watch(tsGlob, function (event) {
      const tsResult = tsProject.src()
      .pipe(tsProject());
    return merge2([ // Merge the two output streams, so this task is finished when the IO of both operations are done. 
		    tsResult.dts
        .pipe(gulp_sourcemaps.write(sourcemapsConfig))
        .pipe(gulp.dest('lib/definitions')),
		     tsResult.js
        .pipe(gulp_sourcemaps.write(sourcemapsConfig))
        .pipe(gulp.dest('lib/js'))
	]);

   });

  
});

gulp.task('assets', function() {
  return gulp.src(JSON_FILES)
  .pipe(gulp.dest('lib'));
});

// Create documentation for Javascript, Typescript, and Sass files
// on the fly
gulp.task('watch:docs', () => {

  // For `gulp-docco` if the need arises
  //  Default configuration options. All of these may be extended by user-specified options.
  //
  //  defaults =
  //    layout:     'parallel'
  //    output:     'docs'
  //    template:   null
  //    css:        null
  //    extension:  null
  //    languages:  {}
  //    marked:     null
  //
  //  Example:
  //
  //  let docco = require("gulp-docco");
  //
  //  gulp.src("./src/*.js")
  //    .pipe(docco(options))
  //    .pipe(gulp.dest('./documentation-output'))
  //
  // Reference: https://www.npmjs.com/package/gulp-docco
  //  Also see: https://jashkenas.github.io/docco/
  //
  let options = {
    layout:     'parallel',
    output:     'docs',
    template:    null,
    css:         null,
    extension:   null,
    languages:   {},
    marked:      null
  }

  // Alert the user whenever changes have been detected and documentation
  // generation is occurring
  function generateUserAlert(ext) {

    switch(ext) {

        case '.js':
          console.log('A JavaScript file has changed; documentation will now be generated...');

          break;

        case '.scss':
          console.log('A Sass file has changed; documentation will now be generated...');

          break;

        case '.ts':
          console.log('A TypeScript file has changed; documentation will now be generated...');

          break;

        default:
          console.log('Generating appropriate folders and styles...');

          break;
      }

      return;
  }

  // Watch files specified and generate the documentation
  // whenever changes are detected.
  function generateDocs(fileSrc) {
    gulp.watch(fileSrc, function (event, ext = path.extname(event.path)) {

      generateUserAlert(ext);

      // Ignore docs, bower_components and node_modules
      return gulp.src(fileSrc)
        .pipe(docco())
        .pipe(gulp.dest(`docs/${ext}`))
        .on('error', gutil.log);
    });
  }

  // Generate documentation for files specified in `glob` vars at top
  // of file
  generateDocs(jsGlob);

  generateDocs(tsGlob);

  generateDocs(scssGlob);
});

// Sugar for `gulp serve:watch`
gulp.task('serve', ['watch:scripts','serve:watch']);

// Configure gulp-nodemon
// This watches the files belonging to the app for changes
// and restarts the src whenever a change is detected
gulp.task('serve:watch', () => {

  nodemon({
    script : 'lib/index.js',
    ext : 'js'
  });
});

// Use the 'del' module to clear all traces of documentation
// Useful before regenerating documentation
// Not currently working due to a globbing issue
// See: https://github.com/sindresorhus/del/issues/50
gulp.task('clean:docs', (callback) => {
  del(['./docs/**/*']).then(function (paths) {
    callback(); // ok
  }, function (reason) {
    callback('Failed to delete files: ' + reason); // fail
  });
});