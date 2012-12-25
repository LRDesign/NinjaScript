goog.provide("ninjascript.NinjaScript")

goog.require("ninjascript.utils")
goog.require("ninjascript.configuration")
goog.require('ninjascript.mutation.EventHandler');

goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.behaviors.Meta');
goog.require('ninjascript.behaviors.Select');

ninjascript.NinjaScript = function(tools, config, jsonDispatcher) {
  this.config = config
  this.tools = tools
  this.tools.ninja = this
  this.jsonDispatcher = jsonDispatcher
  this.mutationHandler =
    new ninjascript.mutation.EventHandler(
      tools.getRootOfDocument(),
      tools.getRootCollection()
    )
};

(function(){
    var prototype = ninjascript.NinjaScript.prototype
    var Utils = ninjascript.utils
    var Behaviors = ninjascript.behaviors

    prototype.packageBehaviors = function(callback) {
      var types = {
        does: Behaviors.Basic,
        chooses: Behaviors.Meta,
        selects: Behaviors.Select
      }
      result = callback(types)
      Utils.enrich(this, result)
    },

    prototype.packageTools = function(object) {
      Utils.enrich(ninjascript.Tools.prototype, object)
    },

    prototype.configure = function(opts) {
      Utils.enrich(this.config, opts)
    },

    prototype.respondToJson = function(handlerConfig) {
      this.jsonDispatcher.addHandler(handlerConfig)
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

    prototype.behavior = prototype.goodBehavior

    prototype.failSafeGo = function() {
      this.failSafeGo = function(){}
      jQuery(window).load( function(){ Ninja.go() } )
    },

    prototype.badBehavior = function(nonsense) {
      throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
    },

    prototype.go = function() {
      var Ninja = this

      if(this.behavior != this.badBehavior) {
        this.mutationHandler.setup()
        this.behavior = this.badBehavior
        this.mutationHandler.fireMutationEvent()
      }
    }
  })()
