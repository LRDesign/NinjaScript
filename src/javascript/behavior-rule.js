goog.provide('ninjascript.BehaviorRule');
goog.require('ninjascript.BehaviorRuleBuilder');
goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.sizzle');

ninjascript.BehaviorRule = function() {
  this.finder = function(root){ return [] }
  this.behavior = null
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
