define(function(){
    return {
      log: function(message) {
        if(false) { //LOGGING TURNED OFF IS 100% faster!
          try {
            console.log(message)
          }
          catch(e) {} //we're in IE or FF w/o Firebug or something
        }
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
  })

