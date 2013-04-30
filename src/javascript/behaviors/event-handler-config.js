goog.provide('ninjascript.behaviors.EventHandlerConfig');
goog.require('ninjascript.Logger');

ninjascript.behaviors.EventHandlerConfig = function(name, config) {
  this.name = name
  this.fallThrough = true
  this.stopDefault = true
  this.stopPropagate = true
  this.stopImmediate = false
  this.fireMutation = false

  if (typeof config == "function") {
    this.handle = config
  }
  else {
    this.handle = config[0]
    config = config.slice(1,config.length)
    var len = config.length
    for(var i = 0; i < len; i++) {
      var found = true
      if (config[i] == "dontContinue" ||
        config[i] == "overridesOthers") {
        this.fallThrough = false
      }
      if (config[i] == "andDoDefault" ||
        config[i] == "continues" ||
        config[i] == "allowDefault") {
        this.stopDefault = false
      }
      if (config[i] == "allowPropagate" || config[i] == "dontStopPropagation") {
        this.stopPropagate = false
      }
      //stopImmediatePropagation is a jQuery thing
      if (config[i] == "andDoOthers") {
        this.stopImmediate = false
      }
      if (config[i] == "changesDOM") {
        this.fireMutation = true
      }
      if (!found) {
        ninjascript.Logger.log("Event handler modifier unrecognized: " + config[i] + " for " + name)
      }
    }
  }
};

(function() {
    var prototype = ninjascript.behaviors.EventHandlerConfig.prototype

    prototype.buildHandlerFunction = function(previousHandler) {
      var handle = this.handle
      var config = this

      var handler = function(eventRecord) {
        handle.apply(this, arguments)
        if(!eventRecord.isFallthroughPrevented() && typeof previousHandler !== "undefined") {
          previousHandler.apply(this, arguments)
        }

        if(config.stopDefault){
          return false
        } else {
          return !eventRecord.isDefaultPrevented()
        }
      }

      if(!this.fallThrough) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.preventFallthrough()
          })
      }
      if(this.stopDefault) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.preventDefault()
          })
      }
      if(this.stopPropagate) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.stopPropagation()
          })
      }
      if(this.stopImmediate) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.stopImmediatePropagation()
          })
      }
      if(this.fireMutation) {
        handler = this.appendAction(handler, function(eventRecord) {
            config.fireMutationEvent()
          })
      }
      handler = this.prependAction(handler, function(eventRecord) {
          eventRecord.isFallthroughPrevented = function(){ return false };
          eventRecord.preventFallthrough = function(){
            eventRecord.isFallthroughPrevented =function(){ return true };
          }
        })

      return handler
    }

    prototype.prependAction = function(handler, doWhat) {
      return function() {
        doWhat.apply(this, arguments)
        return handler.apply(this, arguments)
      }
    }

    prototype.appendAction = function(handler, doWhat) {
      return function() {
        var result = handler.apply(this, arguments)
        doWhat.apply(this, arguments)
        return result
      }
    }
  })()
