goog.provides('ninjascript.Tools')

goog.requires('ninjascript.Behaviors')
goog.requires('ninjascript.Logger')
goog.requires('ninjascript.BehaviorCollection')
goog.requires('ninjascript.exceptions')
goog.requires('ninjascript.utils')
goog.requires('ninjascript.RootContext')

ninjascript.Tools = function(ninja) {
  this.ninja = ninja
  this.behaviorContext = rootContext(this)
};

(function() {
    var prototype = ninjascript.Tools.prototype

    var Behaviors = ninjascript.Behaviors
    var BehaviorCollection = ninjascript.BehaviorCollection
    var Exceptions = ninjascript.Exceptions
    var Utils = ninjascript.utils
    var Logger = ninjascript.Logger
    var rootContext = ninjascript.RootContext

    var TransformFailedException = Exceptions.TransformFailed
    function log(message) {
      Logger.log(message)
    }

    //Handy JS things
    prototype.forEach = Utils.forEach,

    prototype.ensureDefaults = function(config, defaults) {
      if(!(config instanceof Object)) {
        config = {}
      }
      for(var key in defaults) {
        if(typeof config[key] == "undefined") {
          if(typeof this.ninja.config[key] != "undefined") {
            config[key] = this.ninja.config[key]
          } else if(typeof defaults[key] != "undefined") {
            config[key] = defaults[key]
          }
        }
      }
      return config
    },

    //DOM and Events
    prototype.getRootOfDocument = function() {
      return jQuery("html") //document.firstChild)
    },
    prototype.clearRootCollection = function() {
      this.ninja.behavior = this.ninja.goodBehavior
      this.getRootOfDocument().data("ninja-behavior", null)
    },
    prototype.getRootCollection = function() {
      var rootOfDocument = this.getRootOfDocument()
      if(rootOfDocument.data("ninja-behavior") instanceof BehaviorCollection) {
        return rootOfDocument.data("ninja-behavior")
      }

      var collection = new BehaviorCollection(this)
      rootOfDocument.data("ninja-behavior", collection);
      return collection
    },
    prototype.addMutationTargets = function(targets) {
      this.getRootCollection().addMutationTargets(targets)
    },
    prototype.fireMutationEvent = function() {
      this.getRootCollection().fireMutationEvent()
    },
    prototype.detachSyntheticMutationEvents = function() {
      this.getRootCollection().fireMutationEvent = function(){}
      this.getRootCollection().addMutationTargets = function(t){}
    },
    //HTML Utils
    prototype.copyAttributes = function(from, to, which) {
      var attributeList = []
      var attrs = []
      var match = new RegExp("^" + which.join("$|^") + "$")
      to = jQuery(to)
      this.forEach(from.attributes, function(att) {
          if(match.test(att.nodeName)) {
            to.attr(att.nodeName, att.nodeValue)
          }
        })
    },
    prototype.deriveElementsFrom = function(element, means){
      switch(typeof means){
      case 'undefined': return element
      case 'string': return jQuery(means)
      case 'function': return means(element)
      }
    },
    prototype.extractMethod = function(element, formData) {
      if(element.dataset !== undefined &&
        element.dataset["method"] !== undefined &&
        element.dataset["method"].length > 0) {
        log("Override via prototype.dataset = " + element.dataset["method"])
        return element.dataset["method"]
      }
      if(element.dataset === undefined &&
        jQuery(element).attr("data-method") !== undefined) {
        log("Override via data-prototype.method = " + jQuery(element).attr("data-method"))
        return jQuery(element).attr("data-method")
      }
      if(typeof formData !== "undefined") {
        for(var i=0, len = formData.length; i<len; i++) {
          if(formData[i].name == "Method") {
            log("Override via prototype.Method = " + formData[i].value)
            return formData[i].value
          }
        }
      }
      if(typeof element.method !== "undefined") {
        return element.method
      }
      return "GET"
    },
    //Ninjascript utils
    prototype.cantTransform = function(message) {
      throw new TransformFailedException(message)
    },
    prototype.applyBehaviors = function(element, behaviors) {
      this.getRootCollection().apply(element, behaviors)
    },
    prototype.message = function(text, classes) {
      var addingMessage = this.ninja.config.messageWrapping(text, classes)
      jQuery(this.ninja.config.messageList).append(addingMessage)
    },
    prototype.hiddenDiv = function() {
      var existing = jQuery("div#ninja-hide")
      if(existing.length > 0) {
        return existing[0]
      }

      var hide = jQuery("<div id='ninja-hide'></div>").css("display", "none")
      jQuery("body").append(hide)
      this.getRootCollection().applyBehaviorsTo(hide, [this.ninja.suppressChangeEvents()])
      return hide
    }
  })()

//XXX This really what I want here?
goog.require('ninjascript.tools.Overlay')
goog.require('ninjascript.tools.AjaxSubmitter')
goog.require('ninjascript.tools.JSONDispatcher')
