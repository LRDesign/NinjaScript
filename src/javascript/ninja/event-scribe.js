define([],
  function() {
    function EventScribe() {
      this.handlers = {}
      this.currentElement = null
    }

    EventScribe.prototype = {
      makeHandlersRemove: function(element) {
        for(var eventName in this.handlers) {
          var handler = this.handlers[eventName]
          this.handlers[eventName] = function(eventRecord) {
            handler.call(this, eventRecord)
            jQuery(element).remove()
          }
        }
      },
      recordEventHandlers: function (context, behavior) {
        if(this.currentElement !== context.element) {
          if(this.currentElement !== null) {
            this.makeHandlersRemove(this.currentElement)
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
      },
      applyEventHandlers: function(element) {
        for(var eventName in this.handlers) {
          jQuery(element).bind(eventName, this.handlers[eventName])
        }
      }
    }
    return EventScribe
  })
