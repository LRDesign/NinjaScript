define(["ninja"],
  function(Ninja){
    Ninja.packageBehaviors( function(ninja) {
        function confirmDefault(event,elem) {
          if(!confirm($(elem).attr('data-confirm'))) {
            event.preventDefault()
          }
        }
        return {
          confirms: function(configs) {
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
