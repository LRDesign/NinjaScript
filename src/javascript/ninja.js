goog.provide("ninjascript.Ninjascript")

goog.require("ninjascript.utils")
goog.require("ninjascript.behaviors")
goog.require("ninjascript.configuration")
goog.require("ninjascript.tools")

/*
function log(message) {
  ninjascript.Utils.log(message)
};
*/

ninjascript.NinjaScript = function() {
  //NinjaScript-wide configurations.  Currently, not very many
  this.config = ninjascript.configuration

  this.behavior = this.goodBehavior
  this.jsonDispatcher = new JSONDispatcher()
  this.tools = new Tools(this)
};

(function(){
    var prototype = ninjascript.NinjaScript.prototype
    var Utils = ninjascript.utils

    prototype.packageBehaviors = function(callback) {
      var types = {
        does: Behaviors.base,
        chooses: Behaviors.meta,
        selects: Behaviors.select
      }
      result = callback(types)
      Utils.enrich(this, result)
    },

    prototype.packageTools = function(object) {
      Utils.enrich(Tools.prototype, object)
    },

    prototype.configure = function(opts) {
      Utils.enrich(this.config, opts)
    },

    prototype.goodBehavior = function(dispatching) {
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
      this.failSafeGo()
    },

    prototype.failSafeGo = function() {
      this.failSafeGo = function(){}
      jQuery(window).load( function(){ Ninja.go() } )
    },

    prototype.badBehavior = function(nonsense) {
      throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
    },

    prototype.respondToJson = function(handlerConfig) {
      this.jsonDispatcher.addHandler(handlerConfig)
    },

    prototype.go = function() {
      var Ninja = this

      function handleMutation(evnt) {
        Ninja.tools.getRootCollection().mutationEventTriggered(evnt);
      }

      if(this.behavior != this.badBehavior) {
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
  })()
