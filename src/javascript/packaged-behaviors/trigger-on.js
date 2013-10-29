goog.provide('ninjascript.packagedBehaviors.triggerOn');

goog.require('ninjascript.plugin');

// There's several things happening here is ways that should be more configurable:
// * A standard overlayAndSubmit
// * an event handler on one tag triggers an event on another
//   Currently, that's $(form).find("select"):change => form:submit
// * the normal affordance for triggering the submit (a submit input) is removed
//
// triggerOn should take configs of "startEvent", "consequenceEvent", "targetElem"
// Very simple "removed" behavior
//
// Other issue is the interface:
//
// {
//   "form#id": submitWithAjax(),
//   "form#id select": triggerOn("change", "form#id", "submit"),
//   "form#id input[type='submit']": removed()
// }
//
// That's a lot of stuff for a fairly normal behavior.  It'd be nice if there were a
// way to then say:
//
// {
//   "form#id": [submitWithAjax(), submitOnDropdown()]
// }
//
// And have submitOnDropdown() be able to unfold into the other two parts
//
// Or
//
// Ninja.behavior(Ninja.submitOnDropdown("form#id)) unfold into the behavior config
//
// and you could always fold several together:
//
// Ninja.behavior({
//   "form#id": submitWithAjax()
// })
// Ninja.behavior(
//   submitOnDropdown("form#id")
// )
//
// or even
//
// Ninja.behavior({
//   "form#id": submitWithAjax()
//   },
//   submitOnDropdown("form#id")
// )
//
// or
//
// Ninja.behavior({
//   "form#id": submitWithAjax()
//   }
// ).submitOnDropdown("form#id")
//
// The semantics are: this is a behavior that applies to multiple elements - so it needs a different
// scope than what { "selector": behavior } allows for...
//
;(function() {
    ninjascript.plugin(function(hooks) { hooks.behaviors({
            cascadeEvent: function(configs){
            },
            removed: function(){
            },
            triggersOnSelect: function(configs) {
              configs = this.tools.ensureDefaults(configs,
                {
                  busyElement: undefined,
                  selectElement: function(form){ return $(form).find("select").first() },
                  submitElement: function(form){ return $(form).find("input[type='submit']").first() },
                  placeholderText: "Select to go",
                  placeholderValue: "instructions"
                })
              var jsonActions = configs
              if (typeof(configs.actions) === "object") {
                jsonActions = configs.actions
              }

              return new this.types.does({
                  priority: 20,
                  helpers: {
                    findOverlay: function(elem) {
                      return this.deriveElementsFrom(elem, configs.busyElement)
                    }
                  },
                  transform: function(form) {
                    var select = this.deriveElementsFrom(form, configs.selectElement)
                    var submit = this.deriveElementsFrom(form, configs.submitElement)
                    if( typeof select == "undefined" || typeof submit == "undefined" ) {
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
          })
    })})()
