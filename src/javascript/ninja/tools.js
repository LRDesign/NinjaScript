define([ "ninja/behaviors", "ninja/behavior-collection", "ninja/exceptions", "utils", "ninja/overlay", "ninja/ajax-submitter", "ninja/json-handler", "ninja/root-context"
  ], function(
    Behaviors,     BehaviorCollection,      Exceptions,     
    Utils,     Overlay,     AjaxSubmitter,      JSONHandler,
    rootContext
  ) {
    var CantTransformException = Exceptions.CantTransform
    var log = Utils.log

    function Tools(ninja) {
      this.ninja = ninja
      this.behaviorContext = rootContext(this)
    }

    Tools.prototype = {
      //Handy JS things
      forEach: Utils.forEach,
      enrich: function(left, right) {
        return jQuery.extend(left, right)
      },
      ensureDefaults: function(config, defaults) {
        if(!config instanceof Object) {
          config = {}
        }
        return this.enrich(defaults, config)
      },
      //DOM and Events
      getRootOfDocument: function() {
        return jQuery("html") //document.firstChild)
      },
      clearRootCollection: function() {
        this.ninja.behavior = this.ninja.goodBehavior
        this.getRootOfDocument().data("ninja-behavior", null)
      },
      getRootCollection: function() {
        var rootOfDocument = this.getRootOfDocument()
        if(rootOfDocument.data("ninja-behavior") instanceof BehaviorCollection) {
          return rootOfDocument.data("ninja-behavior")
        }

        var collection = new BehaviorCollection(this)
        rootOfDocument.data("ninja-behavior", collection);
        return collection
      },
      suppressChangeEvents: function() {
        return new Behaviors.base({
            events: {
              DOMSubtreeModified: function(e){},
              DOMNodeInserted: function(e){}
            }
          })
      },
      addMutationTargets: function(targets) {
        this.getRootCollection().addMutationTargets(targets)
      },
      fireMutationEvent: function() {
        this.getRootCollection().fireMutationEvent()
      },
      detachSyntheticMutationEvents: function() {
        this.getRootCollection().fireMutationEvent = function(){}
        this.getRootCollection().addMutationTargets = function(t){}
      },
      //HTML Utils
      copyAttributes: function(from, to, which) {
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
      deriveElementsFrom: function(element, means){
        switch(typeof means){
        case 'undefined': return element
        case 'string': return jQuery(means)
        case 'function': return means(element)
        }
      },
      extractMethod: function(element, formData) {
        if(element.dataset !== undefined && 
          element.dataset["method"] !== undefined && 
          element.dataset["method"].length > 0) {
          log("Override via dataset: " + element.dataset["method"])
          return element.dataset["method"]
        }
        if(element.dataset === undefined && 
          jQuery(element).attr("data-method") !== undefined) {
          log("Override via data-method: " + jQuery(element).attr("data-method"))
          return jQuery(element).attr("data-method")
        }
        if(typeof formData !== "undefined") {
          for(var i=0, len = formData.length; i<len; i++) {
            if(formData[i].name == "Method") {
              log("Override via Method: " + formData[i].value)
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
      cantTransform: function() {
        throw new TransformFailedException
      },
      applyBehaviors: function(element, behaviors) {
        this.getRootCollection().apply(element, behaviors)
      },
      message: function(text, classes) {
        var addingMessage = this.ninja.config.messageWrapping(text, classes)
        jQuery(this.ninja.config.messageList).append(addingMessage)
      },
      hiddenDiv: function() {
        var existing = jQuery("div#ninja-hide")
        if(existing.length > 0) {
          return existing[0]
        }

        var hide = jQuery("<div id='ninja-hide'></div>").css("display", "none")
        jQuery("body").append(hide)
        this.getRootCollection().applyBehaviorsTo(hide, [this.suppressChangeEvents()])
        return hide
      },
      overlay: function() {
        // I really liked using 
        //return new Overlay([].map.apply(arguments,[function(i) {return i}]))
        //but IE8 doesn't implement ECMA 2.6.2 5th ed.

        return new Overlay(jQuery.makeArray(arguments))
      },
      busyOverlay: function(elem) {
        var overlay = this.overlay(elem)
        overlay.set.addClass("ninja_busy")
        overlay.laziness = this.ninja.config.busyLaziness
        return overlay
      },
      //Currently, this doesn't respect changes to the original block...
      //There should be an "Overlay behavior" that gets applied
      buildOverlayFor: function(elem) {
        var overlay = jQuery(document.createElement("div"))
        var hideMe = jQuery(elem)
        var offset = hideMe.offset()
        overlay.css("position", "absolute")
        overlay.css("top", offset.top)
        overlay.css("left", offset.left)
        overlay.width(hideMe.outerWidth())
        overlay.height(hideMe.outerHeight())
        overlay.css("zIndex", "2")
        return overlay
      },

      jsonHandler: function(desc) {
        return new JSONHandler(desc)
      },

      ajaxSubmitter: function() {
        return new AjaxSubmitter()
      },

      ajaxToJson: function(desc) {
        var handler = this.jsonHandler(desc)
        var submitter = this.ajaxSubmitter()
        submitter.dataType = 'json'
        submitter.onSuccess = function(xhr, statusText, data) {
          handler.receive(data)
        }
        return submitter
      },

      overlayAndSubmit: function(target, action, jsonHandling) {
        var overlay = this.busyOverlay(this.findOverlay(target))

        var submitter
        if( typeof jsonHandling == "undefined" ) {
          submitter = this.ajaxSubmitter()
        }
        else {
          submitter = this.ajaxToJson(jsonHandling)
        }

        submitter.sourceForm(target)

        submitter.action = action
        submitter.method = this.extractMethod(target, submitter.formData)

        submitter.onResponse = function(xhr, statusTxt) {
          overlay.remove()
        }
        overlay.affix()
        submitter.submit()
      }
    }

    return Tools;

    //= require "ajax-submitter"
    //= require "json-handler"
  })
