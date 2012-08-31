goog.provide('ninjascript.packagedBehaviors.utility');

goog.require('ninjascript.singleton');

(function() {
    Ninja.packageBehaviors(function(ninja) {
        return {
          suppressChangeEvents: function() {
            return new ninja.does({
                events: {
                  DOMSubtreeModified: function(e){},
                  DOMNodeInserted: function(e){}
                }
              })
          }
        }
      })
  })()
