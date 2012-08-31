goog.provide('ninjascript.BehaviorBinding')

goog.require('ninjascript.utils')
goog.require('ninjascript.Tools')

ninjascript.BehaviorBinding = function() {
  this.stashedElements = []
  this.eventHandlerSet = {}
};
ninjascript.BehaviorBinding.prototype = new ninjascript.Tools;

(function() {
    var Utils = ninjascript.utils
    var forEach = Utils.forEach

    var prototype = ninjascript.BehaviorBinding.prototype
    var class = ninjascript.BehaviorBinding

    class.initialize = function(parent, config, element) {
      this.behaviorConfig = config
      this.parent = parent

      this.acquireTransform(config.transform)
      this.acquireEventHandlers(config.eventHandlers)
      this.acquireHelpers(config.helpers)

      this.previousElement = element
      this.postElement = element
      var newElem = config.transform.call(this, elem)
      if(newElem !== undefined) {
        this.postElement = newElem
      }

      return this
    }

    class.acquireEventHandlers = function(handlers) {
      var len = handlers.length
      var i = 0
      var eventName
      for(i=0; i < len; i++) {
        eventName = handlers[i].name
        this[eventName] = handlers[i].buildHandlerFunction(this.parent[eventName])
      }
    }

    class.acquireHelpers = function(helpers) {
      for(var name in helpers) {
        this[name] = helpers[name]
      }
    }

    prototype.binding = function(behaviorConfig, element) {
      function binding(config, element) {
        class.initialize.call(this, config, element)
      }
      binding.prototype = this
      return new binding(behaviorConfig)
    }

    prototype.stash = function(element) {
      this.stashedElements.unshift(element)
    }

    prototype.unstash = function() {
      return this.stashedElements.shift()
    }

    prototype.clearStash = function() {
      this.stashedElements = []
    }

    //XXX Of prototype.concern = how do cascading events work out?
    //Should there be a first catch?  Or a "doesn't cascade" or something?
    prototype.cascadeEvent = function(event) {
      var formDiv = this.hiddenDiv()
      forEach(this.stashedElements, function(element) {
          var elem = jQuery(element)
          elem.data("ninja-visited", this)
          jQuery(formDiv).append(elem)
          elem.trigger(event)
        })
    }

    prototype.bindHandlers = function() {
      var el = jQuery(this.element)
      var handlers = this.behaviorConfig.eventHandlers
      var len = handlers.length
      for(var i = 0; i < len; i++) {
        el.bind(handlers[i].name, this[handlers[i].name])
      }
    }

    prototype.unbindHandlers = function() {
      var el = jQuery(this.element)
      var handlers = this.behaviorConfig.eventHandlers
      var len = handlers.length
      for(var i = 0; i < len; i++) {
        el.unbind(handlers[i].name, this[handlers[i].name])
      }
    }
  }
)()
