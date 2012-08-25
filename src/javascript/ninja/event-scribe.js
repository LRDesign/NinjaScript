goog.provide('ninjascript.EventScribe');

function ninjascript.EventScribe() {
  this.handlers = {}
  this.currentElement = null
};

(function() {
    var prototype = ninjascript.EventScribe.prototype

    prototype.recordEventHandlers = function (context, behavior) {
      if(this.currentElement !== context.element) {
        if(this.currentElement !== null) {
          this.applyEventHandlers(this.currentElement)
          this.handlers = {}
        }
        this.currentElement = context.element
      }
      for(var eventName in behavior.eventHandlers) {
        var oldHandler = this.handlers[eventName]
        if(typeof oldHandler == "undefined") {
          oldHandler = function(){return true}
        }
        this.handlers[eventName] = behavior.buildHandler(context, eventName, oldHandler)
      }
    }

    prototype.applyEventHandlers = function(element) {
      for(var eventName in this.handlers) {
        jQuery(element).bind(eventName, this.handlers[eventName])
      }
    }

  })()
