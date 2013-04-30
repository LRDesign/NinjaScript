goog.provide("ninjascript.NinjaScript")

goog.require('ninjascript.Logger');

goog.require('ninjascript.Extensible');

goog.require("ninjascript.utils");
goog.require("ninjascript.configuration");
goog.require('ninjascript.mutation.EventHandler');

goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.behaviors.Meta');
goog.require('ninjascript.behaviors.Select');

ninjascript.NinjaScript = function() {
};

ninjascript.NinjaScript.prototype = new ninjascript.Extensible

;(function(){
    var prototype = ninjascript.NinjaScript.prototype
    var Utils = ninjascript.utils
    var Behaviors = ninjascript.behaviors

    var log = ninjascript.Logger.log

    prototype.package = function(callback) {
      var targets = {
        Ninja: this,
        tools: this.tools,
      }
      return ninjascript.Extensible.package(targets, callback)
    }

    prototype.configure = function(opts) {
      Utils.enrich(this.config, opts)
    }

    prototype.respondToJson = function(handlerConfig) {
      this.jsonDispatcher.addHandler(handlerConfig)
    }

    prototype.goodBehavior = function(dispatching) {
      var collection = this.extensions.collection
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
    }

    prototype.behavior = prototype.goodBehavior

    prototype.failSafeGo = function() {
      this.failSafeGo = function(){}
      jQuery(window).load( function(){ Ninja.go() } )
    }

    prototype.badBehavior = function(nonsense) {
      throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
    }

    prototype.go = function() {
      if(this.behavior != this.badBehavior) {
        this.behavior = this.badBehavior
        this.extensions.collection.finalize()
        this.mutationHandler.setup()
        this.mutationHandler.fireMutationEvent()
      }
    }

    prototype.stop = function() {
      this.mutationHandler.teardown()
      this.behavior = this.goodBehavior
    }
  })()
