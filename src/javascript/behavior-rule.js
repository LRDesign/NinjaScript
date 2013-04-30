goog.provide('ninjascript.BehaviorRule');
goog.provide('ninjascript.BehaviorRuleBuilder');
goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.sizzle');
goog.require('ninjascript.utils');

ninjascript.BehaviorRule = function() {
  this.finder = function(root){ return [] }
  this.behavior = null
}

ninjascript.BehaviorRuleBuilder = function() {
  this.ninja = null
  this.rules = []
  this.finder = null
  this.behaviors = []
}

ninjascript.BehaviorRule.build = function(ninja, finder, behavior) {
  builder = new ninjascript.BehaviorRuleBuilder
  builder.ninja = ninja
  builder.finder = finder
  builder.buildRules(behavior)
  return builder.rules
}

;(function(){
    var prototype = ninjascript.BehaviorRule.prototype

    prototype.match = function(root) {
      return this.matchRoots([root], this.finder)
    }

    prototype.matchRoots = function(roots, finder) {
      var i, rootLen = roots.length
      var elementSet = []
      for(i = 0; i < rootLen; i++) {
        elementSet = elementSet.concat(finder(roots[i]))
      }
      return elementSet
    }

    prototype.chainFinder = function(nextFinder) {
      var precedant = this
      return function(root){
        return this.matchRoots(precendent.finder(root), nextFinder)
      }
    }

    prototype.chainRule = function(nextFinder, behavior) {
      var antecedant = new ninjascript.BehaviorRule
      antecedant.finder = this.chainFinder(nextFinder)
      antecedant.behavior = behavior
      return antecedant
    }
  })()

;(function(){
    var prototype = ninjascript.BehaviorRuleBuilder.prototype
    var Utils = ninjascript.utils

    prototype.normalizeFinder = function(finder) {
      if(typeof finder == "string") {
        return function(root){
          return ninjascript.sizzle( finder, root )
        }
      } else {
        return finder
      }
    }

    prototype.normalizeBehavior = function(ninja, behavior) {
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
        var behavior = this.normalizeBehavior(this.behaviors.shift())
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
