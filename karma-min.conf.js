module.exports = function(config){
  var coverage = process.env["COVERAGE"]
  var conf = {};
  conf.files = [
    'spec_support/jquery-1.6.1.js',
    'spec_support/fixtures/*.js',
    'spec_support/**/*.html',
    'generated/javascript/ns.min.js',
    'spec/**/*.js'
   ];

   conf.autoWatch = true;

   conf.browsers = ['Chrome'];
   conf.frameworks = ['jasmine', 'sinon', 'closure'];
   //conf.plugins = ['karma-closure'];

   conf.preprocessors = {
     "spec_support/fixtures/**/*.html": ['html2js'],
     "spec_support/fixtures/**/*.js": ['html2js'],
     'generated/javascript/**/*.js': ['coverage']
   };

   conf.singleRun = true;
   conf.reporters = ['coverage', 'progress'];

   conf.junitReporter = {
     outputFile: 'test_out/unit.xml',
     suite: 'unit'
   };

   config.set(conf);
 }
