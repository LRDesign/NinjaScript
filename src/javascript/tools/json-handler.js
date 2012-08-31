goog.provide('ninjascript.tools.JSONHandler')

/**
 * Intention is to use JSONHandler like this:
 *
 * this.ajaxToJson({
     *   item: function(html) {
       *     $('#items').append($(html))
       *   },
     *   item_count: function(html) {
       *     $('#item_count').replace($(html))
       *   }
     *   })
 *
 * And the server sends back something like:
 *
 * { "item": "<li>A list item<\li>", "item_count": 17 }
 **/
ninjascript.tools.JSONHandler = function(desc) {
  this.desc = desc
};

(function(){
    var prototype = ninjascript.tools.JSONHandler.prototype

    prototype.receive = function (data) {
      this.compose([], data, this.desc)
      return null
    },
    prototype.compose = function(path, data, desc) {
      if(typeof desc == "function") {
        try {
          desc.call(this, data) //Individual functions can share data through handler
        }
        catch(problem) {
          Utils.log("prototype.Caught = " + problem + " while handling JSON at " + path.join("/"))
        }
      }

      else {
        for(var key in data) {
          if(data.hasOwnProperty(key)) {
            if( key in desc) {
              this.compose(path.concat([key]), data[key], desc[key])
            }
          }
        }
      }
      return null
    },
    prototype.inspectTree = function(desc) {
      var keys = []
      for(var key in desc) {
        if(typeof desc[key] == "function") {
          keys.push(key)
        }
        else {
          Utils.forEach(this.inspectTree(desc[key]), function(subkey) {
              keys.push(key + "." + subkey)
            })
        }
      }
      return keys
    },
    prototype.inspect = function() {
      return this.inspectTree(this.desc).join("\n")
    }
  })()
