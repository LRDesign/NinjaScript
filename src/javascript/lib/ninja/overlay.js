      function Overlay(list) {
        var elements = this.convertToElementArray(list)
        this.laziness = 0
        var ov = this
        this.set = jQuery(jQuery.map(elements, function(element, idx) {
              return ov.buildOverlayFor(element)
            }))
      }

      Overlay.prototype = {
        convertToElementArray: function(list) {
          var h = this
          switch(typeof list) {
          case 'undefined': return []
          case 'boolean': return []
          case 'string': return h.convertToElementArray(jQuery(list))
          case 'function': return h.convertToElementArray(list())
          case 'object': {
              //IE8 barfs on 'list instanceof Element'
              if("focus" in list && "blur" in list && !("jquery" in list)) {
                return [list]
              }
              else if("length" in list && "0" in list) {
                var result = []
                forEach(list, function(element) {
                    result = result.concat(h.convertToElementArray(element))
                  })
                return result
              }
              else {
                return []
              }
            }
          }
        },

        buildOverlayFor: function(elem) {
          var overlay = jQuery(document.createElement("div"))
          var hideMe = jQuery(elem)
          var offset = hideMe.offset()
          overlay.css("position", "absolute")
          overlay.css("top", offset.top)
          overlay.css("left", offset.left)
          overlay.width(hideMe.outerWidth())
          overlay.height(hideMe.outerHeight())
          overlay.css("zIndex", "2")
          overlay.css("display", "none")
          return overlay[0]
        },
        affix: function() {
          this.set.appendTo(jQuery("body"))
          overlaySet = this.set
          window.setTimeout(function() {
              overlaySet.css("display", "block")
            }, this.laziness)
        },
        remove: function() {
          this.set.remove()
        }
      }