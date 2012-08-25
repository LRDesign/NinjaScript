goog.provide('ninjascript.behaviors')

goog.require('ninjascript.exceptions')

;
(function() {
    var CouldntChooseException = ninjascript.exceptions.CouldntChoose
    var behaviors = ninjascript.behaviors

    behaviors.meta = function(setup, callback) {
      setup(this)
      this.chooser = callback
    }

    behaviors.meta.prototype = {
      choose: function(element) {
        var chosen = this.chooser(element)
        if(chosen !== undefined) {
          return chosen.choose(element)
        }
        else {
          throw new CouldntChooseException("Couldn't choose behavior for " . element.toString())
        }
      }
    }

    //For these to be acceptable, I need to fit them into the pattern that
    //Ninja.behavior accepts...
    behaviors.select = function(menu) {
      this.menu = menu
    }

    behaviors.select.prototype = {
      choose: function(element) {
        for(var selector in this.menu) {
          if(jQuery(element).is(selector)) {
            return this.menu[selector].choose(element)
          }
        }
        return null //XXX Should raise exception
      }
    }

    behaviors.base = function(handlers) {
      this.helpers = {}
      this.eventHandlers = []
      this.lexicalOrder = 0
      this.priority = 0

      if (typeof handlers.transform == "function") {
        this.transform = handlers.transform
        delete handlers.transform
      }
      if (typeof handlers.helpers != "undefined"){
        this.helpers = handlers.helpers
        delete handlers.helpers
      }
      if (typeof handlers.priority != "undefined"){
        this.priority = handlers.priority
      }
      delete handlers.priority
      if (typeof handlers.events != "undefined") {
        this.eventHandlers = handlers.events
      }
      else {
        this.eventHandlers = handlers
      }

      return this
    }

    behaviors.base.prototype = {
      //XXX applyTo?
      apply: function(elem) {
        var context = this.inContext({})

        elem = this.applyTransform(context, elem)
        jQuery(elem).data("ninja-visited", context)

        this.applyEventHandlers(context, elem)

        return elem
      },
      priority: function(value) {
        this.priority = value
        return this
      },
      choose: function(element) {
        return this
      },
      inContext: function(basedOn) {
        function Context() {}
        Context.prototype = basedOn
        return Ninja.tools.enrich(new Context, this.helpers)
      },
      applyTransform: function(context, elem) {
        var previousElem = elem
        var newElem = this.transform.call(context, elem)
        if(newElem === undefined) {
          return previousElem
        }
        else {
          return newElem
        }
      },
      applyEventHandlers: function(context, elem) {
        for(var eventName in this.eventHandlers) {
          var handler = this.eventHandlers[eventName]
          jQuery(elem).bind(eventName, this.makeHandler.call(context, handler))
        }
        return elem
      },
      recordEventHandlers: function(scribe, context) {
        for(var eventName in this.eventHandlers) {
          scribe.recordHandler(this, eventName, function(oldHandler){
              return this.makeHandler.call(context, this.eventHandlers[eventName], oldHandler)
            }
          )
        }
      },
      buildHandler: function(context, eventName, previousHandler) {
        var handle
        var fallThrough = true
        var stopDefault = true
        var stopPropagate = true
        var stopImmediate = false
        var fireMutation = false
        var config = this.eventHandlers[eventName]

        if (typeof config == "function") {
          handle = config
        }
        else {
          handle = config[0]
          config = config.slice(1,config.length)
          var len = config.length
          for(var i = 0; i < len; i++) {
            var found = true
            if (config[i] == "dontContinue" ||
              config[i] == "overridesOthers") {
              fallThrough = false
            }
            if (config[i] == "andDoDefault" ||
              config[i] == "continues" ||
              config[i] == "allowDefault") {
              stopDefault = false
            }
            if (config[i] == "allowPropagate" || config[i] == "dontStopPropagation") {
              stopPropagate = false
            }
            //stopImmediatePropagation is a jQuery thing
            if (config[i] == "andDoOthers") {
              stopImmediate = false
            }
            if (config[i] == "changesDOM") {
              fireMutation = true
            }
            if (!found) {
              console.log("Event handler modifier unrecognized: " + config[i])
            }
          }
        }
        var handler = function() {
          var eventRecord = Array.prototype.shift.call(arguments)
          Array.prototype.unshift.call(arguments, this)
          Array.prototype.unshift.call(arguments, eventRecord)

          handle.apply(context, arguments)
          if(!eventRecord.isFallthroughPrevented()) {
            previousHandler.apply(context, arguments)
          }
          if(stopDefault){
            return false
          } else {
            return !eventRecord.isDefaultPrevented()
          }
        }
        if(!fallThrough) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.preventFallthrough()
            })
        }
        if(stopDefault) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.preventDefault()
            })
        }
        if(stopPropagate) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.stopPropagation()
            })
        }
        if (stopImmediate) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.stopImmediatePropagation()
            })
        }
        if (fireMutation) {
          handler = this.appendAction(handler, function(eventRecord) {
              Ninja.tools.fireMutationEvent()
            })
        }
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.isFallthroughPrevented = function(){ return false };
            eventRecord.preventFallthrough = function(){
              eventRecord.isFallthroughPrevented =function(){ return true };
            }
          })

        return handler
      },
      prependAction: function(handler, doWhat) {
        return function() {
          doWhat.apply(this, arguments)
          return handler.apply(this, arguments)
        }
      },
      appendAction: function(handler, doWhat) {
        return function() {
          var result = handler.apply(this, arguments)
          doWhat.apply(this, arguments)
          return result
        }
      },
      transform: function(elem){
        return elem
      }
    }

    return behaviors
  })()

goog.require('ninjascript.behaviors.utility');
goog.require('ninjascript.behaviors.standard');
goog.require('ninjascript.behaviors.placeholder');
goog.require('ninjascript.behaviors.triggerOn');
goog.require('ninjascript.behaviors.confirm');
