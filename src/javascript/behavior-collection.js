goog.provide('ninjascript.BehaviorCollection')

goog.require('ninjascript.sizzle')
goog.require('ninjascript.behaviors.Abstract')
goog.require('ninjascript.utils')
goog.require('ninjascript.exceptions')
goog.require('ninjascript.BehaviorBinding')

ninjascript.BehaviorCollection = function(parts) {
  this.lexicalCount = 0
  this.behaviors = {}
  this.selectors = []
  this.parts = parts
  this.tools = parts.tools
  return this
}

;(function() {
    var prototype = ninjascript.BehaviorCollection.prototype

    var Utils = ninjascript.utils
    var Behaviors = ninjascript.behaviors
    var BehaviorBinding = ninjascript.BehaviorBinding

    var forEach = Utils.forEach

    var log = ninjascript.Logger.log

    var TransformFailedException = ninjascript.exceptions.TransformFailed
    var CouldntChooseException = ninjascript.exceptions.CouldntChoose

    prototype.ninja = function() { return this.parts.ninja }

    prototype.addBehavior = function(selector, behavior) {
      if(Utils.isArray(behavior)) {
        forEach(behavior, function(behaves){
            this.addBehavior(selector, behaves)
          }, this)
      }
      else if(behavior instanceof ninjascript.behaviors.Abstract) {
        this.insertBehavior(selector, behavior)
      }
      else if(typeof behavior == "function"){
        this.addBehavior(selector, behavior.call(this.ninja()))
      }
      else {
        var behavior = new Behaviors.Basic(behavior)
        this.addBehavior(selector, behavior)
      }
    }

    prototype.insertBehavior = function(selector, behavior) {
      behavior.lexicalOrder = this.lexicalCount
      this.lexicalCount += 1
      if(this.behaviors[selector] === undefined) {
        this.selectors.push(selector)
        this.behaviors[selector] = [behavior]
      }
      else {
        this.behaviors[selector].push(behavior)
      }
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
    prototype.collectBehaviors = function(element, collection, behaviors) {
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
    }

    //XXX Still doesn't quite handle the sub-behavior case - order of application
    prototype.apply = function(element, startBehaviors, selectorIndex) {
      var applicableBehaviors = [], len = this.selectors.length
      this.collectBehaviors(element, applicableBehaviors, startBehaviors)
      var context = jQuery(element).data('ninja-visited')
      if (!context) {
        if(typeof selectorIndex == "undefined") {
          selectorIndex = 0
        }
        for(var j = selectorIndex; j < len; j++) {
          if(jQuery(element).is(this.selectors[j])) {
            this.collectBehaviors(element, applicableBehaviors, this.behaviors[this.selectors[j]])
          }
        }
        context = BehaviorBinding(this.tools)
      }
      else {
        context.unbindHandlers()
      }
      this.applyBehaviorsInContext(context, element, applicableBehaviors)
    }

    prototype.applyAll = function(root){
      var len = this.selectors.length
      var collection = this
      for(var i = 0; i < len; i++) {
        //Sizzle?
        forEach(ninjascript.sizzle( this.selectors[i], root), //an array, not a jQuery
          function(elem){
            if (!jQuery(elem).data("ninja-visited")) { //Pure optimization
              collection.apply(elem, [], i)
            }
          })
      }
    }
  })()
