define(["utils"], function(Utils) {
    function JSONDispatcher() {
      this.handlers = []
    }

    JSONDispatcher.prototype = {
      addHandler: function(handler) {
        this.handlers.push(new JSONHandler(handler))
      },
      dispatch: function(json) {
        var len = this.handlers.length
        for(var i = 0; i < len; i++) {
          try {
            this.handlers[i].receive(json)
          }
          catch(problem) {
            Utils.log("Caught: " + problem + " while handling JSON response.")
          }
        }
      },
      inspect: function() {
        var handlers = []
        Utils.forEach(this.handlers, function(handler){
            handlers.push(handler.inspect())
          })
        return "JSONDispatcher, " + this.handlers.length + " handlers:\n" + handlers.join("\n")
      }
    }

    function JSONHandler(desc) {
      this.desc = desc
    }

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

    JSONHandler.prototype = {
      receive: function (data) {
        this.compose([], data, this.desc)
        return null
      },
      compose: function(path, data, desc) {
        if(typeof desc == "function") {
          try {
            desc.call(this, data) //Individual functions can share data through handler
          }
          catch(problem) {
            Utils.log("Caught: " + problem + " while handling JSON at " + path.join("/"))
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
      inspectTree: function(desc) {
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
      inspect: function() {
        return this.inspectTree(this.desc).join("\n")
      }
    }

    return JSONDispatcher
  })
