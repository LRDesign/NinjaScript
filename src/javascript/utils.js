define(function(){
    function Utils() {
      this.log_function = null
    }

    Utils.prototype = {
      log: function(message) {
        this.log_function(message)
      },
      active_logging: function(message) {
        try {
          console.log(message)
        }
        catch(e) {} //we're in IE or FF w/o Firebug or something
      },
      inactive_logging: function(message) {
      },
      disactivate_logging: function() {
        this.log_function = this.inactive_logging
      },
      activate_logging: function() {
        this.log_function = this.active_logging
      },
      isArray: function(candidate) {
        return (candidate.constructor == Array)
      },

      forEach: function(list, callback, thisArg) {
        if(typeof list.forEach == "function") {
          return list.forEach(callback, thisArg)
        }
        else if(typeof Array.prototype.forEach == "function") {
          return Array.prototype.forEach.call(list, callback, thisArg)
        }
        else {
          var len = Number(list.length)
          for(var k = 0; k < len; k+=1) {
            if(typeof list[k] != "undefined") {
              callback.call(thisArg, list[k], k, list)
            }
          }
          return
        }
      }
    }
    var utils = new Utils
    utils.disactivate_logging()

    return utils
  })
