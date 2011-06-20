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
    for(var key in data) {
      if(data.hasOwnProperty(key)) {
        if( key in desc) {
          if( typeof desc[key] == "function" ) {
            desc[key].call(this, data[key])
          } 
          else {
            this.compose(path + [key], data[key], desc[key])
          }
        }
      }
    }
    return null
  }
}

//= require "tools"
//= require "ajax-submitter"

Tools.prototype.jsonHandler = function(desc) {
  return new JSONHandler(desc)
}

Tools.prototype.ajaxToJson = function(desc) {
  var handler = this.jsonHandler(desc)
  var submitter = this.ajaxSubmitter()
  submitter.dataType = 'json'
  submitter.onSuccess = function(xhr, statusText, data) {
    handler.receive(data)
  }
  return submitter
}
