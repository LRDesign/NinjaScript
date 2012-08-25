goog.provides("ninjascript.Logger")

ninjascript.Logger = function() {
  this.log_function = null
};

(function(){
    var prototype = ninjascript.Logger.prototype

    prototype.log = function(message) {
      this.log_function(message)
    },
    prototype.active_logging = function(message) {
      try {
        console.log(message)
      }
      catch(e) {} //we're in IE or FF w/o Firebug or something
    },
    prototype.inactive_logging = function(message) {
    },
    prototype.disactivate_logging = function() {
      this.log_function = this.inactive_logging
    },
    prototype.activate_logging = function() {
      this.log_function = this.active_logging
    }
  })()
