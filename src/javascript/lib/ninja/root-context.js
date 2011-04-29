      function RootContext() {
        this.stashedElements = []
        this.eventHandlerSet = {}
      }

      RootContext.prototype = Ninja.tools.enrich(
        new Tools(Ninja),
        {
          stash: function(element) {
            this.stashedElements.unshift(element)
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
