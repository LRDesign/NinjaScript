goog.provide('ninjascript.mutation.EventHandler');

ninjascript.mutation.EventHandler = function(docRoot, rootCollection) {
  this.eventQueue = []
  this.mutationTargets = []
  this.behaviorCollection = rootCollection
  this.docRoot = docRoot
};

(function(){
    var prototype = ninjascript.mutation.EventHandler.prototype

    prototype.setup = function() {
      var mutationHandler = this
      function handleMutation(event) {
        mutationHandler.mutationEventTriggered(event)
      }

      docRoot.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
      docRoot.one("DOMSubtreeModified DOMNodeInserted", function(){
          mutationHandler.detachSyntheticMutationEvents()
        })

      this.setup = function(){}
    }

    prototype.detachSyntheticMutationEvents = function() {
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
        log("mutation event - first")
        this.enqueueEvent(evnt)
        this.handleQueue()
      }
      else {
        log("mutation event - queueing")
        this.enqueueEvent(evnt)
      }
    }

    prototype.enqueueEvent = function(evnt) {
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
    }

    prototype.handleQueue = function(){
      while (this.eventQueue.length != 0){
        this.behaviorCollection.applyAll(this.eventQueue[0].target)
        this.eventQueue.shift()
      }
    }
  })()
