define(["ninja"],
  function(Ninja){
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
              }
            }

            return new ninja.selects({
                "form": {
                  priority: -100,
                  events: { submit: [confirmDefault, "andDoDefault"] }
                },
                "a,input": {
                  priority: -100,
                  events: {  click: [confirmDefault, "andDoDefault"] }
                }
              })
          }
        }
      })
  })
