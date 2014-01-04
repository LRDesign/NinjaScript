module.exports = function(config){
  var coverage = process.env["COVERAGE"]
  var conf = {};
  conf.files = [
    //Library
    'node_modules/closure-library/closure/goog/base.js',
    'spec_support/jquery-1.6.1.js',
    'spec_support/fixtures/*.js',
    'spec_support/**/*.html',
    {pattern: 'node_modules/closure-library/closure/goog/deps.js', included: false },
    'src/deps.js',

    //Source code
    {pattern: 'src/javascript/**/*.js', included: false},

    //Tests
    'spec_support/loaded.js',
    'spec/**/*.js'
   ];

   conf.autoWatch = true;

   conf.browsers = ['Chrome'];
   conf.frameworks = ['jasmine', 'sinon', 'closure'];
   //conf.plugins = ['karma-closure'];

   conf.preprocessors = {
     "spec_support/fixtures/**/*.html": ['html2js'],
     "spec_support/fixtures/**/*.js": ['html2js'],
     '**/src/javascript/**/*.js': ['closure'],
     '**/spec/**/*.js': ['closure', 'closure-iit'],
     '**/node_modules/closure-library/closure/goog/deps.js': ['closure-deps']
   };


   if(coverage){
     process.stdout.write("COVERAGE is set - instrumenting and only running once\n\n");
     conf.singleRun = true;
     conf.reporters = ['coverage', 'progress'];
     conf.preprocessors['**/src/javascript/**/*.js'] = ['coverage'];
   } else {
     conf.reporters = ['progress'];
   }

   conf.junitReporter = {
     outputFile: 'test_out/unit.xml',
     suite: 'unit'
   };

   config.set(conf);
 }
