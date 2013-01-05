goog.provide('ninjascript.Extensions')

ninjascript.Extensions = function(){
};

ninjascript.Extensions.package(targets, callback){
  var hooks = {}
  var buildHookingFunction = function(target){
    return function(extension){
      for(functionName in extension){
        if(extension.hasOwnProperty(functionName)){
          //XXX: Check for collisions
          ninjascript.Extensions[functionName] = extension[functionName]
          target[functionName] = function() {
            this.extensions[functionName].apply(this.extensions, arguments)
          }
        }
      }
    }
  }
  hooks["Ninja"] = buildHookingFunction(targets.Ninja)
  hooks["tools"] = buildHookingFunction(targets.tools)

  hooks["behaviors"]  =  hooks["Ninja"]
  hooks["behaviours"] =  hooks["Ninja"] //Hey there Erlang!
  hooks["ninja"]      =  hooks["Ninja"]

  return callback(hooks)
}

;(function(){
    var prototype = ninjascript.Extensions.prototype

    //Push these out through whatever minification/obfuscation happens
    prototype.expose = function(){
      this["tools"] = this.tools
      this["ninja"] = this.ninja
      this["jsonHandler"] = this.jsonHandler
      this["config"] = this.config
      this["types"] = this.types
    }
  })()

//I have some misgivings about this approach - maybe the noise I'm hearing is
//that the distinction betweeen Ninja for behaviors and Ninja.tools for tools
//is not worth the effort
