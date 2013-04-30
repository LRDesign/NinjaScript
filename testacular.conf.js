files = [
 JASMINE,
 JASMINE_ADAPTER,
 'buildtools/jasmine-jquery/lib/jasmine-jquery.js',
 'buildtools/sinon/pkg/sinon.js',
 'buildtools/jasmine-sinon/lib/jasmine-sinon.js',
 'buildtools/google-closure-library/closure/goog/base.js',
 'buildtools/jquery-1.6.1.js',
 'src/deps.js',
 'spec-setup.js',
 {pattern: 'src/javascript/**/*.js', included: false},
 'spec/**/*.js'
];

autoWatch = true;

browsers = ['Chrome'];

var coverage = false
if(coverage){
  reporters = ['coverage', 'progress'];

  preprocessors = {
    '**/src/javascript/**/*.js': 'coverage'
  };
} else {
  reporters = ['progress'];
}

junitReporter = {
  outputFile: 'test_out/unit.xml',
  suite: 'unit'
};
