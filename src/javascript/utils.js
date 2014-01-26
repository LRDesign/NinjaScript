goog.provide("ninjascript.utils");

(function(){
    var utils = ninjascript.utils

    utils.isArray = function(candidate) {
      if(typeof candidate == "undefined"){
        return false
      } else {
        return (candidate.constructor == Array)
      }
    };

    utils.enrich = function(left, right) {
      return jQuery.extend(left, right)
    };

    utils.clone = function(original) {
      return jQuery.extend(true, {}, original)
    };

    if(typeof Array.prototype.filter == "function") {
      utils.filter = function(list, callback, thisArg) {
        if(typeof list.filter == "function") {
          return list.filter(callback, thisArg);
        } else {
          return Array.prototype.filter.call(list, callback, thisArg);
        }
      };
    } else {
      utils.filter = function(list, callback, thisArg) {
        if(typeof list.filter == "function") {
          return list.filter(callback, thisArg);
        } else {
          var newList = [], len = list.length;
          for(var i = 0; i < len; i+=1) {
            if(callback.call(thisArg, list[i], i, list)){
              newList.push(list[i]);
            }
          }
          return newList;
        }
      };
    };

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
