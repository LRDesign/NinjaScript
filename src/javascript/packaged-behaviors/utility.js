goog.provide('ninjascript.packagedBehaviors.utility');

goog.require('ninjascript.plugin');

(function() {
    ninjascript.plugin(function(hooks){
        hooks.behaviors({
          suppressChangeEvents: function() {
            return new this.types.does({
                events: {
                  DOMSubtreeModified: function(e){},
                  DOMNodeInserted: function(e){}
                }
              })
          }
        })
      })
  })()
