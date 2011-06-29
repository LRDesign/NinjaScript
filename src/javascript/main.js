require([
    "ninja",

    "ninja/behaviors/standard",
    "ninja/behaviors/placeholder",
    "ninja/behaviors/trigger-on",

    "ninja/jquery"
  ], function(Ninja, stdBehaviors, placeholder, triggerOn, jquery) {
    window["Ninja"] = Ninja
    Ninja['behavior'] = Ninja.behavior

  })
