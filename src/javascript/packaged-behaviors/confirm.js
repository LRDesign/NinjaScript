goog.provide('ninjascript.packagedBehaviors.confirm');

goog.require('ninjascript.singleton');

(function(){
    Ninja.packageBehaviors( function(ninja) {
        return {
          confirms: function(configs) {

            configs = Ninja.tools.ensureDefaults(configs,
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

            return new ninja.selects({
                "form": new ninja.does({
                  priority: 20,
                  events: { submit: [confirmDefault, "andDoDefault"] }
                }),
                "a,input": new ninja.does({
                  priority: 20,
                  events: {  click: [confirmDefault, "andDoDefault"] }
                })
              })
          }
        }
      })
  })()
