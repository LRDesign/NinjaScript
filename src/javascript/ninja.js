define(   ["utils", "ninja/tools", "ninja/behaviors", "ninja/configuration"], 
  function(Utils,     Tools,     Behaviors, Configs) {
    var log = Utils.log
    
    function NinjaScript() {
      //NinjaScript-wide configurations.  Currently, not very many
      this.config = Configs

      this.behavior = this.goodBehavior
      this.tools = new Tools(this)
    }

    NinjaScript.prototype = {

      packageBehaviors: function(callback) {
        var types = {
          does: Behaviors.base,
          chooses: Behaviors.meta,
          selects: Behaviors.select
        }
        result = callback(types)
        this.tools.enrich(this, result)
      },

      packageTools: function(object) {
        this.tools.enrich(Tools.prototype, object)
      },

      configure: function(opts) {
        this.tools.enrich(this.config, opts)
      },

      goodBehavior: function(dispatching) {
        var collection = this.tools.getRootCollection()
        for(var selector in dispatching) 
        {
          if(typeof dispatching[selector] == "undefined") {
            log("Selector " + selector + " not properly defined - ignoring")
          } 
          else {
            collection.addBehavior(selector, dispatching[selector])
          }
        }
        jQuery(window).load( function(){ Ninja.go() } )
      },

      badBehavior: function(nonsense) {
        throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
      },

      go: function() {
        var Ninja = this

        function handleMutation(evnt) {
          Ninja.tools.getRootCollection().mutationEventTriggered(evnt);
        }

        if(this.behavior != this.misbehavior) {
          var rootOfDocument = this.tools.getRootOfDocument()
          rootOfDocument.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
          //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
          //hack, so nerf it
          rootOfDocument.one("DOMSubtreeModified DOMNodeInserted", function(){
              Ninja.tools.detachSyntheticMutationEvents()
            })
          this.behavior = this.badBehavior
          this.tools.fireMutationEvent()
        }
      }
    }

    return new NinjaScript()
  })
