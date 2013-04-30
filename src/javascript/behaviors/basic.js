goog.provide('ninjascript.behaviors.Basic');

goog.require('ninjascript.behaviors.EventHandlerConfig');
goog.require('ninjascript.behaviors.Abstract');
goog.require('ninjascript.utils');

ninjascript.behaviors.Basic = function(handlers) {
  this.helpers = {}
  this.eventHandlers = []
  this.lexicalOrder = 0
  this.priority = 0

  if (typeof handlers.transform == "function") {
    this.transform = handlers.transform
    delete handlers.transform
  }
  if (typeof handlers.helpers != "undefined"){
    this.helpers = handlers.helpers
    delete handlers.helpers
  }
  if (typeof handlers.priority != "undefined"){
    this.priority = handlers.priority
  }
  delete handlers.priority
  if (typeof handlers.events != "undefined") {
    this.eventHandlers = this.eventConfigs(handlers.events)
  }
  else {
    this.eventHandlers = this.eventConfigs(handlers)
  }

  return this
};

ninjascript.behaviors.Basic.prototype = new ninjascript.behaviors.Abstract;

(function(){
    var prototype = ninjascript.behaviors.Basic.prototype
    var Utils = ninjascript.utils
    var Tools = ninjascript.tools
    var EventConfig = ninjascript.behaviors.EventHandlerConfig

    prototype.priority = function(value) {
      this.priority = value
      return this
    }
    prototype.choose = function(element) {
      return this
    }

    prototype.eventConfigs = function(handlers) {
      var configs = []
      for(var name in handlers) {
        configs.push(new EventConfig(name, handlers[name]))
      }
      return configs
    }

    prototype.transform = function(elem){
      return elem
    }

    prototype.expandRules = function(rule){
      return []
    }

    prototype.helpers = {}
  })()
