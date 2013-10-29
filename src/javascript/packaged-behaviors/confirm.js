goog.provide('ninjascript.packagedBehaviors.confirm');

goog.require('ninjascript.plugin');

(function(){
    ninjascript.plugin(function(hooks){
        hooks.behaviors({
          confirms: function(configs) {

            configs = this.tools.ensureDefaults(configs,
              { confirmMessage: function(elem){
                  return $(elem).attr('data-confirm')
                }})
            if(typeof configs.confirmMessage == "string"){
              message = configs.confirmMessage
              configs.confirmMessage = function(elem){
                return message
              }
            }

            function confirmDefault(event,elem) {
              if(!confirm(configs.confirmMessage(elem))) {
                event.preventDefault()
                event.preventFallthrough()
              }
            }

            return new this.types.selects({
                "form": new this.types.does({
                  priority: 20,
                  events: { submit: [confirmDefault, "andDoDefault"] }
                }),
                "a,input": new this.types.does({
                  priority: 20,
                  events: {  click: [confirmDefault, "andDoDefault"] }
                })
              })
          }
        })
      })
  })()
