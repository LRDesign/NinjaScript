goog.provide('ninjascript.BehaviorBinding')

goog.require('ninjascript.utils')

ninjascript.BehaviorBinding = function(tools){
  var parentClass = function(){
    this.stashedElements = []
    this.hiddenElements = []
    this.eventHandlerSet = {}
  }
  parentClass.prototype = tools

  var prototype = new parentClass

  var Utils = ninjascript.utils
  var forEach = Utils.forEach

  var identityBehavior = { }
  identityBehavior.transform = function(element){ return element }
  identityBehavior.eventHandlers = []
  identityBehavior.helpers = {}

  prototype.initialize = function(parent, config, element) {
    this.behaviorConfig = config
    this.parent = parent

    this.acquireTransform(config.transform)
    this.acquireEventHandlers(config.eventHandlers)
    this.acquireHelpers(config.helpers)

    this.previousElement = element
    this.postElement = element
    var newElem = this.transform(element)
    if(newElem !== undefined) {
      this.postElement = newElem
    }
    this.element = this.postElement

    return this
  }

  prototype.binding = function(behaviorConfig, element) {
    var parent = this
    var binding = function() {
      this.initialize(parent, behaviorConfig, element)
    }
    binding.prototype = this
    return new binding()
  }

  prototype.acquireEventHandlers = function(handlers) {
    var len = handlers.length
    var i = 0
    var eventName
    for(i=0; i < len; i++) {
      eventName = handlers[i].name
      var context = this
      var handles = handlers[i].buildHandlerFunction(this.parent[eventName])
      this[eventName] = function(){
        var eventRecord = Array.prototype.shift.call(arguments)
        Array.prototype.unshift.call(arguments, this) //Because 'this' is the receiving element
        Array.prototype.unshift.call(arguments, eventRecord)

        return handles.apply(context, arguments)
      }
    }
  }

  prototype.acquireHelpers = function(helpers) {
    for(var name in helpers) {
      this[name] = helpers[name]
    }
  }

  prototype.acquireTransform = function(transform) {
    this.transform = transform
  }

  //XXX Should some or all of these methods migrate to Tools
  //Criteria: accessible outside of behaviors proper (e.g. other tools)
  prototype.stash = function(element) {
    this.stashedElements.unshift(element)
    jQuery(element).detach()
    return element
  }

  prototype.unstash = function() {
    var elem = jQuery(this.stashedElements.shift())
    var formDiv = this.hiddenDiv()
    elem.data("ninja-visited", this)
    jQuery(formDiv).append(elem)
    this.parent.bindHandlers()
    return elem
  }

  prototype.clearStash = function() {
    this.stashedElements = []
  }

  //XXX Of prototype.concern = how do cascading events work out?
  //Should there be a first catch?  Or a "doesn't cascade" or something?
  prototype.cascadeEvent = function(event) {
    var idx, len;
    while(this.stashedElements.length > 0) {
      this.hiddenElements.unshift(this.unstash())
    }
    len = this.hiddenElements.length
    for(idx = 0; idx < len; idx++){
      this.hiddenElements[idx].trigger(event)
    }
  }

  prototype.bindHandlers = function() {
    var el = jQuery(this.postElement)
    var handlers = this.behaviorConfig.eventHandlers
    var len = handlers.length
    for(var i = 0; i < len; i++) {
      el.bind(handlers[i].name, this[handlers[i].name])
    }
  }

  prototype.unbindHandlers = function() {
    var el = jQuery(this.postElement)
    var handlers = this.behaviorConfig.eventHandlers
    var len = handlers.length
    for(var i = 0; i < len; i++) {
      el.unbind(handlers[i].name, this[handlers[i].name])
    }
  }

  return prototype.binding(identityBehavior, null)
}
