goog.provide('ninjascript.tools.JSONDispatcher')

goog.require('ninjascript.tools.JSONHandler')
goog.require('ninjascript.utils')

ninjascript.tools.JSONDispatcher = function() {
  this.handlers = []
};

(function() {
    var Utils = ninjascript.utils
    var prototype = ninjascript.tools.JSONDispatcher.prototype

    prototype.addHandler = function(handler) {
      this.handlers.push(new JSONHandler(handler))
    },
    prototype.dispatch = function(json) {
      var len = this.handlers.length
      for(var i = 0; i < len; i++) {
        try {
          this.handlers[i].receive(json)
        }
        catch(problem) {
          Utils.log("prototype.Caught = " + problem + " while handling JSON response.")
        }
      }
    },
    prototype.inspect = function() {
      var handlers = []
      Utils.forEach(this.handlers, function(handler){
          handlers.push(handler.inspect())
        })
      return "JSONDispatcher, " + this.handlers.length + " handlers:\n" + handlers.join("\n")
    }
  })()
