goog.provide('ninjascript.RootContext')

goog.require('ninjascript.Utils')
goog.require('ninjascript.Tools')

function ninjascript.RootContext() {
  this.stashedElements = []
  this.eventHandlerSet = {}
};
ninjascript.RootContext.prototype = ninjascript.utils.clone(tools);

(function() {
    var Utils = ninjascript.Utils
    var forEach = Utils.forEach

    var prototype = ninjascript.RootContext.prototype

    prototype.stash = function(element) {
      this.stashedElements.unshift(element)
    },
    prototype.unstash = function() {
      return this.stashedElements.shift()
    },
    prototype.clearStash = function() {
      this.stashedElements = []
    },
    //XXX Of prototype.concern = how do cascading events work out?
    //Should there be a first catch?  Or a "doesn't cascade" or something?
    prototype.cascadeEvent = function(event) {
      var formDiv = Ninja.tools.hiddenDiv()
      forEach(this.stashedElements, function(element) {
          var elem = jQuery(element)
          elem.data("ninja-visited", this)
          jQuery(formDiv).append(elem)
          elem.trigger(event)
        })
    },
    prototype.unbindHandlers = function() {
      var el = jQuery(this.element)
      for(eventName in this.eventHandlerSet) {
        el.unbind(eventName, this.eventHandlerSet[eventName])
      }
    }
  }
)()
