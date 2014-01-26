goog.provide('ninjascript.tools.JSONDispatcher')

goog.require('ninjascript.tools.JSONHandler')
goog.require('ninjascript.utils')
goog.require('ninjascript.Logger')

ninjascript.tools.JSONDispatcher = function() {
  this.handlers = []
};

(function() {
    var Utils = ninjascript.utils
    var prototype = ninjascript.tools.JSONDispatcher.prototype
    var logger = ninjascript.Logger.forComponent("json-dispatcher");

    prototype.addHandler = function(handler) {
      this.handlers.push(new ninjascript.tools.JSONHandler(handler))
    },
    prototype.dispatch = function(json) {
      var len = this.handlers.length
      for(var i = 0; i < len; i++) {
        try {
          this.handlers[i].receive(json)
        }
        catch(problem) {
          logger.error("prototype.Caught = " + problem + " while handling JSON response.")
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
