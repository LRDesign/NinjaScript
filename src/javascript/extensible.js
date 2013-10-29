goog.provide('ninjascript.Extensible');

ninjascript.Extensible = function(){
};

/* This class-level function sets up access functions on a throwaway object and
 * passes it into a callback method. Extensions to Ninjascript call
 * ninjascript.plugin with a callback function that can then call
 * hooks.behaviors or hooks.tools to add methods to those prototypes.
 *
 * c.f. the packaged-behaviors directory for examples of use
 *
 */
ninjascript.Extensible.addPackage = function(targets, callback){
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
