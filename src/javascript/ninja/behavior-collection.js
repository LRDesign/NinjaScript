define(["sizzle-1.0", "ninja", "ninja/behaviors", "utils", 
    "ninja/root-context", "ninja/event-scribe", "ninja/exceptions"], 
  function(Sizzle, Ninja, Behaviors, Utils, RootContext, EventScribe, Exceptions) {

    var forEach = Utils.forEach
    var log = Utils.log

    var TransformFailedException = Exceptions.TransformFailed

    function BehaviorCollection() {
      this.lexicalCount = 0
      this.eventQueue = []
      this.behaviors = {}
      this.selectors = []
      this.mutationTargets = []
      return this
    }

    BehaviorCollection.prototype = {
      addBehavior: function(selector, behavior) {
        if(Utils.isArray(behavior)) {
          forEach(behavior, function(behaves){
              this.addBehavior(selector, behaves)
            }, this)
        }
        else if(behavior instanceof Behaviors.base) {
          this.insertBehavior(selector, behavior)
        } 
        else if(behavior instanceof Behaviors.select) {
          this.insertBehavior(selector, behavior)
        }
        else if(behavior instanceof Behaviors.meta) {
          this.insertBehavior(selector, behavior)
        }
        else if(typeof behavior == "function"){
          this.addBehavior(selector, behavior())
        }
        else {
          var behavior = new Behaviors.base(behavior)
          this.addBehavior(selector, behavior)
        }
      },
      insertBehavior: function(selector, behavior) {
        behavior.lexicalOrder = this.lexicalCount
        this.lexicalCount += 1
        if(this.behaviors[selector] === undefined) {
          this.selectors.push(selector)
          this.behaviors[selector] = [behavior]
        }
        else {
          this.behaviors[selector].push(behavior)
        }
      },
      addMutationTargets: function(targets) {
        this.mutationTargets = this.mutationTargets.concat(target)
      },
      fireMutationEvent: function() {
        var targets = this.mutationTargets
        if (targets.length > 0 ) {
          for(var target = targets.shift(); 
            targets.length > 0; 
            target = targets.shift()) {
            jQuery(target).trigger("thisChangedDOM")
          }
        }
        else {
          Ninja.tools.getRootOfDocument().trigger("thisChangedDOM")
        }
      },
      mutationEventTriggered: function(evnt){
        if(this.eventQueue.length == 0){
          log("mutation event - first")
          this.enqueueEvent(evnt)
          this.handleQueue()
        }
        else {
          log("mutation event - queueing")
          this.enqueueEvent(evnt)
        }
      },
      enqueueEvent: function(evnt) {
        var eventCovered = false
        var uncovered = []
        forEach(this.eventQueue, function(val) {
            eventCovered = eventCovered || jQuery.contains(val.target, evnt.target)
            if (!(jQuery.contains(evnt.target, val.target))) {
              uncovered.push(val)
            }
          })
        if(!eventCovered) {
          uncovered.unshift(evnt)
          this.eventQueue = uncovered
        } 
      },
      handleQueue: function(){
        while (this.eventQueue.length != 0){
          this.applyAll(this.eventQueue[0].target)
          this.eventQueue.shift()
        }
      },
      applyBehaviorsTo: function(element, behaviors) {
        return this.applyBehaviorsInContext(new RootContext, element, behaviors)
      },
      applyBehaviorsInContext: function(context, element, behaviors) {
        var curContext, 
        applyList = [], 
        scribe = new EventScribe
        Ninja.tools.enrich(scribe.handlers, context.eventHandlerSet)

        behaviors = behaviors.sort(function(left, right) {
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

        forEach(behaviors,
          function(behavior){
            //XXX This needs to have exception handling back
            try {
              curContext = behavior.inContext(context)
              element = behavior.applyTransform(curContext, element)

              context = curContext
              context.element = element

              scribe.recordEventHandlers(context, behavior)
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
        jQuery(element).data("ninja-visited", context)

        scribe.applyEventHandlers(element)
        Ninja.tools.enrich(context.eventHandlerSet, scribe.handlers)

        this.fireMutationEvent()

        return element
      },
      collectBehaviors: function(element, collection, behaviors) {
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
      },
      //XXX Still doesn't quite handle the sub-behavior case - order of application
      apply: function(element, startBehaviors, selectorIndex) {
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
          this.applyBehaviorsTo(element, applicableBehaviors)
        }
        else {
          context.unbindHandlers()
          this.applyBehaviorsInContext(context, element, applicableBehaviors)
        }
      },
      applyAll: function(root){
        var len = this.selectors.length
        for(var i = 0; i < len; i++) {
          var collection = this

          //Sizzle?

          forEach(Sizzle( this.selectors[i], root), //an array, not a jQuery
            function(elem){
              if (!jQuery(elem).data("ninja-visited")) { //Pure optimization
                collection.apply(elem, [], i)
              }
            })


          //        jQuery(root).find(this.selectors[i]).each( 
          //          function(index, elem){
          //            if (!jQuery(elem).data("ninja-visited")) { //Pure optimization
          //              collection.apply(elem, [], i)
          //            }
          //          }
          //        )
        }
      }
    }
    return BehaviorCollection
  })
