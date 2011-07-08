define(["ninja"], function(Ninja) {
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
  })
