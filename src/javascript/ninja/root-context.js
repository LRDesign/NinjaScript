define(["utils"], function(Utils) {
    var forEach = Utils.forEach

    return function(tools) {

      function RootContext() {
        this.stashedElements = []
        this.eventHandlerSet = {}
      }

      RootContext.prototype = tools.enrich(
        tools,
        {
          stash: function(element) {
            this.stashedElements.unshift(element)
          },
          unstash: function() {
            return this.stashedElements.shift()
          },
          clearStash: function() {
            this.stashedElements = []
          },
          //XXX Of concern: how do cascading events work out?
          //Should there be a first catch?  Or a "doesn't cascade" or something?
          cascadeEvent: function(event) {
            var formDiv = Ninja.tools.hiddenDiv()
            forEach(this.stashedElements, function(element) {
                var elem = jQuery(element)
                elem.data("ninja-visited", this)
                jQuery(formDiv).append(elem)
                elem.trigger(event)
              })
          },
          unbindHandlers: function() {
            var el = jQuery(this.element)
            for(eventName in this.eventHandlerSet) {
              el.unbind(eventName, this.eventHandlerSet[eventName])
            }
          }
        })

      return RootContext
    }
  })

