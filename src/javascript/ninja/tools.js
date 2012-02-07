define([ "ninja/behaviors", "ninja/behavior-collection", "ninja/exceptions",
    "utils", "ninja/root-context"
  ], function(
    Behaviors,     BehaviorCollection,      Exceptions,
    Utils,     rootContext
  ) {
    var TransformFailedException = Exceptions.TransformFailed
    function log(message) {
      Utils.log(message)
    }

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
      cantTransform: function(message) {
        throw new TransformFailedException(message)
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
        this.getRootCollection().applyBehaviorsTo(hide, [this.ninja.suppressChangeEvents()])
        return hide
      }
    }

    return Tools;
  })
