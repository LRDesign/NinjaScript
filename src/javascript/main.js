require([
    "ninja",
    "ninja/behaviors/all",
    "ninja/tools/all",
    "ninja/jquery"
  ], function(Ninja, stdBehaviors, placeholder, triggerOn, allTools, jquery) {
    window["Ninja"] = Ninja
    Ninja['behavior'] = Ninja.behavior

  })
