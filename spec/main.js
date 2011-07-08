require([
    "ninja",
    "ninja/behaviors/all",
    "ninja/tools/all",
    "ninja/jquery"
  ], function(ninja, stdBehaviors, placeholder, triggerOn, jquery) {
    Ninja = ninja
    require(["libs/jasmine-1.0.1/jasmine.js"], function() {
        require(["libs/jasmine-1.0.1/jasmine-html.js", "libs/jasmine-jquery-1.1.2.js", "libs/jasmine-ajax/mock-ajax.js", "spec-setup.js"], function() {
            require([
                "spec/ajax_submitter.js",
                "spec/ajax_to_json.js",
                "spec/composing-event-handlers.js",
                "spec/metabehaviors.js",
                "spec/ninja_tools.js",
                "spec/overlays.js",
                "spec/packaged_behaviors.js",
                "spec/placeholding.js",
                "spec/priority.js"
              ], function() {
                var jasmineEnv = jasmine.getEnv();
                jasmineEnv.updateInterval = 1000;

                var trivialReporter = new jasmine.TrivialReporter();

                jasmineEnv.addReporter(trivialReporter);

                jasmineEnv.specFilter = function(spec) {
                  return trivialReporter.specFilter(spec);
                };

                function execJasmine() {
                  jasmineEnv.execute();
                }

                require.ready(function() {
                    execJasmine()
                  })
              })
          })
      })
  })
