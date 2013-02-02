goog.provide('ninjascript.Extensible');

ninjascript.Extensible = function(){
};

ninjascript.Extensible.package = function(targets, callback){
  var hooks = {}
  var buildHookingFunction = function(target){
    return function(extension){
      for(functionName in extension){
        if(extension.hasOwnProperty(functionName)){
          //XXX: Check for collisions
          target[functionName] = extension[functionName]
        }
      }
    }
  }
  hooks["Ninja"] = buildHookingFunction(targets.Ninja)
  hooks["tools"] = buildHookingFunction(targets.tools)

  hooks["behaviors"]  =  hooks["Ninja"]
  hooks["behaviours"] =  hooks["Ninja"] //Hey there, Erlang!
  hooks["ninja"]      =  hooks["Ninja"]

  return callback(hooks)
}

;(function(){
    var prototype = ninjascript.Extensible.prototype

    prototype.inject = function(components){
      this.extensions = components
      for(property in components){
        if(components.hasOwnProperty(property)){
          this[property] = components[property]
        }
      }
    }
  })()

//I have some misgivings about this approach - maybe the noise I'm hearing is
//that the distinction betweeen Ninja for behaviors and Ninja.tools for tools
//is not worth the effort
