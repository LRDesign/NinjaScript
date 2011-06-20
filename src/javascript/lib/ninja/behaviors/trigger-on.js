(function() {
    function actOnSelect(ninja) {
      return {
        triggersOnSelect: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs,
            { 
              busyElement: undefined,
              placeholderText: "Select to go",
              placeholderValue: "instructions"
            })
          var jsonActions = configs
          if (typeof(configs.actions) === "object") {
            jsonActions = configs.actions
          }

          return new ninja.does({
              priority: 20,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              transform: function(form) {
                var select = $(form).find("select").first()
                if( typeof select == "undefined" ) {
                  this.cantTransform()
                }
                select.prepend("<option value='"+ configs.placeholderValue  +"'> " + configs.placeholderText + "</option>")
                select.val(configs.placeholderValue)
                $(form).find("input[type='submit']").remove()
                return form
              },
              events: {
                change: [
                  function(evnt, elem) {
                    this.overlayAndSubmit(elem, elem.action, jsonActions)

                }, "andDoDefault" ]
              }

            })
        }
      };
    }
    Ninja.packageBehaviors(actOnSelect)
  }());
