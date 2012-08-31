goog.provide('ninjascript.BehaviorCollection')

goog.require('ninjascript.sizzle')
goog.require('ninjascript.behaviors.Abstract')
goog.require('ninjascript.utils')
goog.require('ninjascript.exceptions')

ninjascript.BehaviorCollection = function(tools) {
  this.lexicalCount = 0
  this.behaviors = {}
  this.selectors = []
  this.tools = tools
  return this
};

(function() {
    var prototype = ninjascript.BehaviorCollection.prototype

    var Utils = ninjascript.utils
    var Behaviors = ninjascript.behaviors
    var BehaviorBinding = ninjascript.BehaviorBinding

    var forEach = Utils.forEach

    function log(message) {
      Logger.log(message)
    }

    var TransformFailedException = ninjascript.exceptions.TransformFailed
    var CouldntChooseException = ninjascript.exceptions.CouldntChoose

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
        this.addBehavior(selector, behavior())
      }
      else {
        var behavior = new Behaviors.base(behavior)
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
      var curContext,
      rootContext = context,

      behaviors = this.sortBehaviors(behaviors)

      /*
       * This replaces an arcane setup by which transforms that completely
       * changed the element in question "broke" the chain of event handlers
       *
       * At the moment, I have a vague un-ease that that had a purpose, but I
       * don't remember what it was.
       */
      forEach(behaviors,
        function(behavior){
          try {
            context = context.binding(behavior, element)
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
        }
      )

      rootContext.visibleElement = element

      jQuery(element).data("ninja-visited", context)

      context.bindHandlers()

      this.fireMutationEvent()

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
        this.applyBehaviorsInContext(new BehaviorBinding, element, applicableBehaviors)
      }
      else {
        context.unbindHandlers()
        this.applyBehaviorsInContext(context, element, applicableBehaviors)
      }
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
