goog.provides("ninjascript.utils");

(function(){
    var utils = ninjascript.utils

    utils.isArray = function(candidate) {
      return (candidate.constructor == Array)
    },

    utils.enrich = function(left, right) {
      return jQuery.extend({}, left, right)
    },

    utils.clone = function(original) {
      return jQuery.extend(true, {}, original)
    }

    utils.forEach = function(list, callback, thisArg) {
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
  })()
