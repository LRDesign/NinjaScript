goog.provide('ninjascript.BehaviorRuleBuilder');
goog.require('ninjascript.utils');

ninjascript.BehaviorRuleBuilder = function() {
  this.ninja = null
  this.rules = []
  this.finder = null
  this.behaviors = []
}

;(function(){
    var prototype = ninjascript.BehaviorRuleBuilder.prototype;
    var Utils = ninjascript.utils;

    prototype.normalizeFinder = function(finder) {
      if(typeof finder == "string") {
        return function(root){
          return ninjascript.sizzle( finder, root )
        }
      } else {
        return finder
      }
    }

    prototype.normalizeBehavior = function(behavior) {
      if(behavior instanceof ninjascript.behaviors.Abstract) {
        return behavior
      } else if(typeof behavior == "function"){
        return behavior.call(this.ninja)
      } else {
        return new ninjascript.behaviors.Basic(behavior)
      }
    }

    prototype.buildRules = function(behavior) {
      this.rules = []
      this.finder = this.normalizeFinder(this.finder)

      if(Utils.isArray(behavior)) {
        this.behaviors = behavior
      } else {
        this.behaviors = [behavior]
      }

      var i, len = this.behaviors.length
      while(this.behaviors.length > 0) {
        var behavior = this.behaviors.shift();
        behavior = this.normalizeBehavior(behavior);
        if(Utils.isArray(behavior)){
          this.behaviors = this.behaviors.concat(behavior)
        } else {
          var rule = new ninjascript.BehaviorRule
          rule.finder = this.finder
          rule.behavior = behavior
          this.rules.push(rule)
        }
      }
    }
  })()
