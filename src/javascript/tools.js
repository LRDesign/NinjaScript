goog.provide('ninjascript.Tools')

goog.require('ninjascript.Extensible')

goog.require('ninjascript.behaviors.Basic')
goog.require('ninjascript.behaviors.Select')
goog.require('ninjascript.behaviors.Meta')
goog.require('ninjascript.Logger')
goog.require('ninjascript.BehaviorCollection')
goog.require('ninjascript.exceptions')
goog.require('ninjascript.utils')

ninjascript.Tools = function() {
};

ninjascript.Tools.prototype = new ninjascript.Extensible

/*
 * Essential to the working of Ninjascript, but not part of the API
 */
;(function() {
    var prototype = ninjascript.Tools.prototype

    var BehaviorCollection = ninjascript.BehaviorCollection
    var Exceptions = ninjascript.exceptions
    var Utils = ninjascript.utils
    var TransformFailedException = Exceptions.TransformFailed

    var log = ninjascript.Logger.log

    //Handy JS things
    prototype.forEach = Utils.forEach

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
    }

    //DOM and Events
    prototype.getRootOfDocument = function() {
      return jQuery("html") //document.firstChild)
    }

    prototype.getRootCollection = function() {
      return this.ninja.collection
    }

    prototype.fireMutationEvent = function() {
      this.ninja.mutationHandler.fireMutationEvent()
    }

    //HTML Utils
    //XXX new home
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
    }
    prototype.deriveElementsFrom = function(element, means){
      switch(typeof means){
      case 'undefined': return element
      case 'string': return jQuery(means)
      case 'function': return means(element)
      }
    }
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
    }

    //Ninjascript utils
    prototype.cantTransform = function(message) {
      throw new TransformFailedException(message)
    }

    prototype.message = function(text, classes) {
      var addingMessage = this.ninja.config.messageWrapping(text, classes)
      jQuery(this.ninja.config.messageList).append(addingMessage)
    }

    prototype.hiddenDiv = function() {
      var existing = jQuery("div#ninja-hide")
      if(existing.length > 0) {
        return existing[0]
      }

      var hide = jQuery("<div id='ninja-hide'></div>").css("display", "none")
      jQuery("body").append(hide)
      this.getRootCollection().apply(hide, [this.ninja.suppressChangeEvents()])
      return hide
    }
  })()
