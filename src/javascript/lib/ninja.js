Ninja = (function() {
    //= require <sizzle-1.0>
    //= require "utils"

    function NinjaScript() {
      //NinjaScript-wide configurations.  Currently, not very many
      this.config = {
        //This is the half-assed: it should be template of some sort
        messageWrapping: function(text, classes) {
          return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
        },
        messageList: "#messages",
        busyLaziness: 200
      }


      this.behavior = this.goodBehavior
      this.tools = new Tools(this)
    }

    NinjaScript.prototype = {

      packageBehaviors: function(callback) {
        var types = {
          does: Behavior,
          chooses: Metabehavior,
          selects: Selectabehavior
        }
        result = callback(types)
        this.tools.enrich(this, result)
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

    //= require "ninja/tools"

    var Ninja = new NinjaScript();
    //Below here is the dojo - the engines that make NinjaScript work.
    //With any luck, only the helpful and curious should have call to keep
    //reading
    //

    function handleMutation(evnt) {
      Ninja.tools.getRootCollection().mutationEventTriggered(evnt);
    }

    function TransformFailedException(){}
    function CouldntChooseException() { }

    //= require "ninja/ajax-submitter"
    //= require "ninja/overlay"
    //= require "ninja/event-scribe"
    //= require "ninja/root-context"
    //= require "ninja/behavior-collection"
    //= require "ninja/behaviors"

    return Ninja;  
  })();
