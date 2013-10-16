goog.provide('ninjascript.BehaviorCollection')

goog.require('ninjascript.sizzle')
goog.require('ninjascript.behaviors.Abstract')
goog.require('ninjascript.utils')
goog.require('ninjascript.exceptions')
goog.require('ninjascript.BehaviorBinding')
goog.require('ninjascript.BehaviorRule')

ninjascript.BehaviorCollection = function(parts) {
  this.lexicalCount = 0
  this.rules = []
  this.parts = parts
  this.tools = parts.tools
  return this
}

;(function() {
    var prototype = ninjascript.BehaviorCollection.prototype

    var Utils = ninjascript.utils
    var Behaviors = ninjascript.behaviors
    var BehaviorBinding = ninjascript.BehaviorBinding
    var BehaviorRule = ninjascript.BehaviorRule

    var forEach = Utils.forEach

    var log = ninjascript.Logger.log

    var TransformFailedException = ninjascript.exceptions.TransformFailed
    var CouldntChooseException = ninjascript.exceptions.CouldntChoose

    prototype.ninja = function() { return this.parts.ninja }

    prototype.addBehavior = function(finder, behavior) {
      if(Utils.isArray(behavior)) {
        forEach(behavior, function(behaves){
            this.addBehavior(finder, behaves)
          }, this)
      } else {
        forEach(
          BehaviorRule.build(this.ninja(), finder, behavior),
          function(rule){
            this.addBehaviorRule(rule)
          }, this)
      }
    }

    prototype.addBehaviorRule = function(rule) {
      rule.behavior.lexicalOrder = this.lexicalCount
      this.lexicalCount += 1
      this.rules.push(rule)
    }

    prototype.finalize = function() {
      var rule
      var newRules
      for(var i = 0; i < this.rules.length; i++) {
        rule = this.rules[i]
        newRules = rule.behavior.expandRules(rule)
        for(var j = 0; j < newRules.length; j++) {
          this.addBehaviorRule(newRules[j])
        }
      }
    }

    prototype.applyAll = function(root){
      var i, j, k, elemLen, rulesLen, elementList, matrixLen
      var elFound = false
      var collection = this
      var behaviorMatrix = []
      rulesLen = this.rules.length

      for(i = 0; i < rulesLen; i++) {
        elementList = this.rules[i].match(root)
        elemLen = elementList.length
        matrixLen = behaviorMatrix.length
        for(j = 0; j < elemLen; j++){
          for(k = 0; k < matrixLen; k++){
            if(elementList[j] == behaviorMatrix[k].element) {
              behaviorMatrix[k].behaviors.push(this.rules[i].behavior)
              elFound = true
              break
            }
          }
          if(!elFound) {
            behaviorMatrix.push({ element: elementList[j], behaviors: [ this.rules[i].behavior ]})
            matrixLen = behaviorMatrix.length
          }
        }
      }

      for(i = 0; i < matrixLen; i++){
        if (!jQuery(behaviorMatrix[i].element).data("ninja-visited")) { //Pure optimization
          this.apply(behaviorMatrix[i].element, behaviorMatrix[i].behaviors)
        }
      }
    }

    //XXX Still doesn't quite handle the sub-behavior case - order of application
    prototype.apply = function(element, startBehaviors) {
      var applicableBehaviors = [], applicableBehaviors = this.collectBehaviors(element, startBehaviors)

      var context = jQuery(element).data('ninja-visited')
      if (!context) {
        context = BehaviorBinding(this.tools)
      } else {
        context.unbindHandlers()
      }
      this.applyBehaviorsInContext(context, element, applicableBehaviors)
    }

    prototype.collectBehaviors = function(element, behaviors) {
      var collection = []
      forEach(behaviors, function(val) {
          try {
            collection.push(val.choose(element))
          }
          catch(ex) {
            if(ex instanceof CouldntChooseException) {
              log("!!! couldn't choose")
            }
            else {
              log(ex)
              throw(ex)
            }
          }
        })
      return collection
    }

    prototype.applyBehaviorsInContext = function(context, element, behaviors) {
      var rootContext = context,
        behaviors = this.sortBehaviors(behaviors)

        // There was code here (and a comment about "why is this here?"
        // It was here because each transform *might* completely replace the element
        // being worked on - which means that the context-chain needs to be split:
        // The existing chain needs to go with the old element
        // A new chain with these event handlers needs to be started
        //
        // TODO:
        // Figure out the best place to land those concerns
        //
        // Also:
        // ninja-hide currently is protected from mutation events (for various reasons)
        // cascadeEvent (which would trigger the prior chain) also puts element into the hide
        //
        // The "stashed" elements should a) only get put-into-hide once b) get the chain
        // handlers bound when they're injected.
      forEach(behaviors, function(behavior){
          try {
            context = context.binding(behavior, element)
            element = context.element
          }
          catch(ex) {
            if(ex instanceof TransformFailedException) {
              log("!!! Transform failed")
            }
            else {
              log(ex)
              throw ex
            }
          }
        })

      rootContext.visibleElement = element

      jQuery(element).data("ninja-visited", context)

      context.bindHandlers()

      this.tools.fireMutationEvent()

      return element
    }

    prototype.sortBehaviors = function(behaviors) {
      return behaviors.sort(function(left, right) {
          if(left.priority != right.priority) {
            if(left.priority === undefined) {
              return -1
            }
            else if(right.priority === undefined) {
              return 1
            }
            else {
              return left.priority - right.priority
            }
          }
          else {
            return left.lexicalOrder - right.lexicalOrder
          }
        }
      )
    }

  })()
