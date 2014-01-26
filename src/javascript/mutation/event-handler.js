goog.provide('ninjascript.mutation.EventHandler');
goog.require('ninjascript.Logger');
goog.require('ninjascript.utils');

ninjascript.mutation.EventHandler = function(docRoot, rootCollection) {
  this.eventQueue = []
  this.mutationTargets = []
  this.behaviorCollection = rootCollection
  this.docRoot = docRoot

  var mutationHandler = this
  this.handleMutationEvent = function(event) {
    mutationHandler.mutationEventTriggered(event)
  }
  this.handleNaturalMutationEvent = function(){
    mutationHandler.detachSyntheticMutationEvents()
  }
};

(function(){
    var prototype = ninjascript.mutation.EventHandler.prototype
    var logger = ninjascript.Logger.forComponent("mutation");
    var forEach = ninjascript.utils.forEach;

    prototype.setup = function() {
      this.docRoot.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", this.handleMutationEvent)
      this.docRoot.one("DOMSubtreeModified DOMNodeInserted", this.handleNaturalMutationEvent)

      this.setup = function(){}
    }

    prototype.teardown = function() {
      delete this.setup //restore to prototype
      this.docRoot.unbind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", this.handleMutationEvent)
    }

    prototype.detachSyntheticMutationEvents = function() {
      logger.debug("Detaching polyfill mutation functions")
      this.fireMutationEvent = function(){}
      this.addMutationTargets = function(){}
    }

    prototype.addMutationTargets = function(targets) {
      this.mutationTargets = this.mutationTargets.concat(targets)
    }

    prototype.fireMutationEvent = function() {
      var targets = this.mutationTargets
      if (targets.length > 0 ) {
        for(var target = targets[0]; targets.length > 0; target = targets.shift()) {
          jQuery(target).trigger("thisChangedDOM")
        }
      }
      else {
        this.docRoot.trigger("thisChangedDOM")
      }
    }

    prototype.mutationEventTriggered = function(evnt){
      if(this.eventQueue.length == 0){
        this.enqueueEvent(evnt)
        this.handleQueue()
      }
      else {
        this.enqueueEvent(evnt)
      }
    }

    prototype.enqueueEvent = function(evnt) {
      var eventCovered = false
      var uncovered = []
      logger.debug("enqueueing")
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
    }

    prototype.handleQueue = function(){
      logger.info("consuming queue")
      while (this.eventQueue.length != 0){
        this.behaviorCollection.applyAll(this.eventQueue[0].target)
        this.eventQueue.shift()
      }
    }
  })()
