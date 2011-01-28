// vim: sw=2 ft=javascript

Ninja = (function() {
  function log(message) {
    try {
      console.log(message)
    }
    catch(e) {} //we're in IE or FF w/o Firebug or something
  }

  function isArray(candidate) {
    return (candidate.constructor == Array)
  }

  function forEach(list, callback, thisArg) {
    if(typeof list.forEach == "function") {
      return list.forEach(callback, thisArg)
    }
    else if(typeof Array.prototype.forEach == "function") {
      return Array.prototype.forEach.call(list, callback, thisArg)
    }
    else {
      var len = Number(list.length)
      for(var k = 0; k < len; k+=1) {
        if(typeof list[k] != "undefined") {
          callback.call(thisArg, list[k], k, list)
        }
      }
      return
    }
  }

  function NinjaScript() {
    //NinjaScript-wide configurations.  Currently, not very many
    this.config = {
      //This is the half-assed: it should be template of some sort
      messageWrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      messageList: "#messages",
      busyLaziness: 200
    }


    this.behavior = this.goodBehavior
    this.tools = new Tools(this)
  }

  NinjaScript.prototype = {

    packageBehaviors: function(callback) {
      var types = {
        does: Behavior,
        chooses: Metabehavior,
        selects: Selectabehavior
      }
      result = callback(types)
      this.tools.enrich(this, result)
    },

    goodBehavior: function(dispatching) {
      var collection = this.tools.getRootCollection()
      for(var selector in dispatching) 
      {
        if(typeof dispatching[selector] == "undefined") {
          log("Selector " + selector + " not properly defined - ignoring")
        } 
        else {
          collection.addBehavior(selector, dispatching[selector])
        }
      }
      $(window).load( function(){ Ninja.go() } )
    },

    badBehavior: function(nonsense) {
      throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
    },

    go: function() {
      if(this.behavior != this.misbehavior) {
        var rootOfDocument = this.tools.getRootOfDocument()
        rootOfDocument.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
        //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
        //hack, so nerf it
        rootOfDocument.one("DOMSubtreeModified DOMNodeInserted", function(){
            this.fireMutationEvent = function(){}
            this.addMutationTargets = function(t){}
          })
        this.behavior = this.badBehavior
        this.tools.fireMutationEvent()
      }
    }
  }


  function Tools(ninja) {
    this.ninja = ninja
    this.mutationTargets = []
  }

  Tools.prototype = {
    forEach: forEach,
    enrich: function(left, right) {
      return $.extend(left, right)
    },
    ensureDefaults: function(config, defaults) {
      return this.enrich(defaults, config)
    },
    copyAttributes: function(from, to, which) {
      var attributeList = []
      var attrs = []
      var match = new RegExp("^" + which.join("$|^") + "$")
      to = $(to)
      this.forEach(from.attributes, function(att) {
          if(match.test(att.nodeName)) {
            to.attr(att.nodeName, att.nodeValue)
          }
        })
    },
    addMutationTargets: function(targets) {
      this.mutationTargets = this.mutationTargets.concat(target)
    },
    getRootOfDocument: function() {
      return $("html") //document.firstChild)
    },
    fireMutationEvent: function() {
      var targets = this.mutationTargets
      if (targets.length > 0 ) {
        for(var target = targets.shift(); 
          targets.length > 0; 
          target = targets.shift()) {
          $(target).trigger("thisChangedDOM")
        }
      }
      else {
        this.getRootOfDocument().trigger("thisChangedDOM")
        //$("html").trigger("thisChangedDOM")
      }
    },
    clearRootCollection: function() {
      Ninja.behavior = Ninja.goodBehavior
      this.getRootOfDocument().data("ninja-behavior", null)
    },
    getRootCollection: function() {
      var rootOfDocument = this.getRootOfDocument()
      if(rootOfDocument.data("ninja-behavior") instanceof BehaviorCollection) {
        return rootOfDocument.data("ninja-behavior")
      }

      var collection = new BehaviorCollection()
      rootOfDocument.data("ninja-behavior", collection);
      return collection
    },
    deriveElementsFrom: function(element, means){
      switch(typeof means){
      case 'undefined': return element
      case 'string': return $(means)
      case 'function': return means(element)
      }
    },
    suppressChangeEvents: function() {
      return new Behavior({
          events: {
            DOMSubtreeModified: function(e){},
            DOMNodeInserted: function(e){}
          }
        })
    },
    hiddenDiv: function() {
      var existing = $("div#ninja-hide")
      if(existing.length > 0) {
        return existing[0]
      }

      var hide = $("<div id='ninja-hide'></div>").css("display", "none")
      $("body").append(hide)
      Ninja.tools.getRootCollection().applyBehaviorsTo(hide, [Ninja.tools.suppressChangeEvents()])
      return hide
    },
    ajaxSubmitter: function(form) {
      return new AjaxSubmitter(form)
    },
    overlay: function() {
      // I really liked using 
      //return new Overlay([].map.apply(arguments,[function(i) {return i}]))
      //but IE8 doesn't implement ECMA 2.6.2 5th ed.

      return new Overlay(jQuery.makeArray(arguments))
    },
    busyOverlay: function(elem) {
      var overlay = this.overlay(elem)
      overlay.set.addClass("ninja busy")
      overlay.laziness = this.ninja.config.busyLaziness
      return overlay
    },
    extractMethod: function(element, formData) {
      if(element.dataset !== undefined && 
        element.dataset["method"] !== undefined && 
        element.dataset["method"].length > 0) {
        log("Override via dataset: " + element.dataset["method"])
        return element.dataset["method"]
      }
      if(element.dataset === undefined && 
        $(element).attr("data-method") !== undefined) {
        log("Override via data-method: " + $(element).attr("data-method"))
        return $(element).attr("data-method")
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
    //Currently, this doesn't respect changes to the original block...
    buildOverlayFor: function(elem) {
      var overlay = $(document.createElement("div"))
      var hideMe = $(elem)
      var offset = hideMe.offset()
      overlay.css("position", "absolute")
      overlay.css("top", offset.top)
      overlay.css("left", offset.left)
      overlay.width(hideMe.outerWidth())
      overlay.height(hideMe.outerHeight())
      overlay.css("zIndex", "2")
      return overlay
    },
    message: function(text, classes) {
      var addingMessage = this.ninja.config.messageWrapping(text, classes)
      $(this.ninja.config.messageList).append(addingMessage)
    }
  }

  var Ninja = new NinjaScript();
  //Below here is the dojo - the engines that make NinjaScript work.
  //With any luck, only the helpful and curious should have call to keep
  //reading
  //

  function handleMutation(evnt) {
    Ninja.tools.getRootCollection().mutationEventTriggered(evnt);
  }

  function AjaxSubmitter() {
    this.formData = []
    this.action = "/"
    this.method = "GET"
    this.dataType = 'script'

    return this
  }

  AjaxSubmitter.prototype = {
    submit: function() {
      log("Computed method: " + this.method)
      $.ajax(this.ajaxData())
    },

    ajaxData: function() {
      return {
        data: this.formData,
        dataType: this.dataType,
        url: this.action,
        type: this.method,
        complete: this.responseHandler(),
        success: this.successHandler(),
        error: this.onError
      }
    },

    successHandler: function() {
      var submitter = this
      return function(data, statusTxt, xhr) {
        submitter.onSuccess(xhr, statusTxt, data)
      }
    },
    responseHandler: function() {
      var submitter = this
      return function(xhr, statusTxt) {
        submitter.onResponse(xhr, statusTxt)
        Ninja.tools.fireMutationEvent()
      }
    },

    onResponse: function(xhr, statusTxt) {
    },
    onSuccess: function(xhr, statusTxt, data) {
    },
    onError: function(xhr, statusTxt, errorThrown) {
      log(xhr.responseText)
      Ninja.tools.message("Server error: " + xhr.statusText, "error")
    }
  }

  function Overlay(list) {
    var elements = this.convertToElementArray(list)
    this.laziness = 0
    var ov = this
    this.set = $(jQuery.map(elements, function(element, idx) {
          return ov.buildOverlayFor(element)
        }))
  }

  Overlay.prototype = {
    convertToElementArray: function(list) {
      var h = this
      switch(typeof list) {
      case 'undefined': return []
      case 'boolean': return []
      case 'string': return h.convertToElementArray($(list))
      case 'function': return h.convertToElementArray(list())
      case 'object': {
          //IE8 barfs on 'list instanceof Element'
          if("focus" in list && "blur" in list && !("jquery" in list)) {
            return [list]
          }
          else if("length" in list && "0" in list) {
            var result = []
            forEach(list, function(element) {
                result = result.concat(h.convertToElementArray(element))
              })
            return result
          }
          else {
            return []
          }
        }
      }
    },

    buildOverlayFor: function(elem) {
      var overlay = $(document.createElement("div"))
      var hideMe = $(elem)
      var offset = hideMe.offset()
      overlay.css("position", "absolute")
      overlay.css("top", offset.top)
      overlay.css("left", offset.left)
      overlay.width(hideMe.outerWidth())
      overlay.height(hideMe.outerHeight())
      overlay.css("zIndex", "2")
      overlay.css("display", "none")
      return overlay[0]
    },
    affix: function() {
      this.set.appendTo($("body"))
      overlaySet = this.set
      window.setTimeout(function() {
          overlaySet.css("display", "block")
        }, this.laziness)
    },
    remove: function() {
      this.set.remove()
    }
  }

  function BehaviorCollection() {
    this.lexicalCount = 0
    this.eventQueue = []
    this.behaviors = {}
    this.selectors = []
    return this
  }

  function EventScribe() {
    this.handlers = {}
    this.currentElement = null
  }

  EventScribe.prototype = {
    makeHandlersRemove: function(element) {
      for(var eventName in this.handlers) {
        var handler = this.handlers[eventName]
        this.handlers[eventName] = function(eventRecord) {
          handler(eventRecord)
          $(element).remove()
        }
      }
    },
    recordEventHandlers: function (context, behavior) {
      if(this.currentElement !== context.element) {
        if(this.currentElement !== null) {
          this.makeHandlersRemove(this.currentElement)
          this.applyEventHandlers(this.currentElement)
          this.handlers = {}
        }
        this.currentElement = context.element
      }
      for(var eventName in behavior.eventHandlers) {
        var oldHandler = this.handlers[eventName]
        if(typeof oldHandler == "undefined") {
          oldHandler = function(){}
        }
        this.handlers[eventName] = behavior.buildHandler(context, eventName, oldHandler)
      }
    },
    applyEventHandlers: function(element) {
      for(var eventName in this.handlers) {
        $(element).bind(eventName, this.handlers[eventName])
      }
    }
  }

  function TransformFailedException(){}
  function CouldntChooseException() { }

  function RootContext() {
    this.stashedElements = []
  }

  RootContext.prototype = {
    stash: function(element) {
      this.stashedElements.unshift(element)
    },
    clearStash: function() {
      this.stashedElements = []
    },
    //XXX Of concern: how do cascading events work out?
    //Should there be a first catch?  Or a "doesn't cascade" or something?
    cascadeEvent: function(event) {
      var formDiv = Ninja.tools.hiddenDiv()
      forEach(this.stashedElements, function(element) {
          var elem = $(element)
          elem.data("ninja-visited", true)
          $(formDiv).append(elem)
          elem.trigger(event)
        })
    }
  }

  BehaviorCollection.prototype = {
    //XXX: check if this is source of new slowdown
    addBehavior: function(selector, behavior) {
      if(isArray(behavior)) {
        forEach(behavior, function(behaves){
            this.addBehavior(selector, behaves)
          }, this)
      }
      else if(behavior instanceof Behavior) {
        this.insertBehavior(selector, behavior)
      } 
      else if(behavior instanceof Selectabehavior) {
        this.insertBehavior(selector, behavior)
      }
      else if(behavior instanceof Metabehavior) {
        this.insertBehavior(selector, behavior)
      }
      else if(typeof behavior == "function"){
        this.addBehavior(selector, behavior())
      }
      else {
        var behavior = new Behavior(behavior)
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
          eventCovered = eventCovered || $.contains(val.target, evnt.target)
          if (!($.contains(evnt.target, val.target))) {
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
      var curContext, 
      context = new RootContext, 
      applyList = [], 
      scribe = new EventScribe

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
      $(element).data("ninja-visited", true)

      scribe.applyEventHandlers(element)

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
      if (!$(element).data("ninja-visited")) {
        if(typeof selectorIndex == "undefined") {
          selectorIndex = 0
        }
        for(var j = selectorIndex; j < len; j++) {
          if($(element).is(this.selectors[j])) {
            this.collectBehaviors(element, applicableBehaviors, this.behaviors[this.selectors[j]])
          }
        }
      }
      this.applyBehaviorsTo(element, applicableBehaviors)
    },
    applyAll: function(root){
      var len = this.selectors.length
      for(var i = 0; i < len; i++) {
        var collection = this

        //Sizzle?
        $(root).find(this.selectors[i]).each( 
          function(index, elem){
            if (!$(elem).data("ninja-visited")) { //Pure optimization
              collection.apply(elem, [], i)
            }
          }
        )
      }
    }
  }

  function Metabehavior(setup, callback) {
    setup(this)
    this.chooser = callback
  }

  Metabehavior.prototype = {
    choose: function(element) {
      var chosen = this.chooser(element)
      if(chosen !== undefined) {
        return chosen.choose(element)
      }
      else {
        throw new CouldntChooseException
      }
    }
  }

  //For these to be acceptable, I need to fit them into the pattern that
  //Ninja.behavior accepts...
  function Selectabehavior(menu) {
    this.menu = menu
  }

  Selectabehavior.prototype = {
    choose: function(element) {
      for(var selector in this.menu) {
        if($(element).is(selector)) {
          return this.menu[selector].choose(element)
        }
      }
      return null //XXX Should raise exception
    }
  }

  function Behavior(handlers) {
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
  Behavior.prototype = {   
    //XXX applyTo?
    apply: function(elem) {
      var context = this.inContext({})

      elem = this.applyTransform(context, elem)
      $(elem).data("ninja-visited", true)

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
        $(elem).bind(eventName, this.makeHandler.call(context, handler))
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
      var stopDefault = true
      var stopPropagate = true
      var stopImmediate = false
      var config = this.eventHandlers[eventName]

      if (typeof config == "function") {
        handle = config
      }
      else {
        handle = config[0]
        config = config.slice(1,config.length)
        var len = config.length
        for(var i = 0; i < len; i++) {
          if (config[i] == "default") {
            stopDefault = false
          }
          if (config[i] == "propagate") {
            stopPropagate = false
          }
          if (config[i] == "immediate" || config[i] == "other") {
            stopImmediate = false
          }
        }
      }
      var handler = function(eventRecord) {
        handle.call(context, eventRecord, this, previousHandler)
        return !stopDefault
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

      return handler
    },
    prependAction: function(handler, doWhat) {
      return function(eventRecord) {
        doWhat(eventRecord)
        handler(eventRecord)
      }
    },
    transform: function(elem){ 
      return elem 
    }
  }

  return Ninja;  
})();

(function() {
  function standardBehaviors(ninja){
    return {
      // START READING HERE
      //Stock behaviors

      //Converts either a link or a form to send its requests via AJAX - we eval
      //the Javascript we get back.  We get an busy overlay if configured to do
      //so.
      //
      //This farms out the actual behavior to submitsAsAjaxLink and
      //submitsAsAjaxForm, c.f.
      submitsAsAjax: function(configs) {
        return new ninja.chooses(function(meta) {
            meta.asLink = Ninja.submitsAsAjaxLink(configs),
            meta.asForm = Ninja.submitsAsAjaxForm(configs)
          },
          function(elem) {
            switch(elem.tagName.toLowerCase()) {
            case "a": return this.asLink
            case "form": return this.asForm
            }
          })
      },


      //Converts a link to send its GET request via Ajax - we assume that we get
      //Javascript back, which is eval'd.  While we're waiting, we'll throw up a
      //busy overlay if configured to do so.  By default, we don't use a busy
      //overlay.
      //
      //Ninja.submitAsAjaxLink({
      //  busyElement: function(elem) { elem.parent }
      //})
      //
      submitsAsAjaxLink: function(configs) {
        if(!(configs instanceof Object)) {
          configs = { busyElement: undefined }
        }
        return new ninja.does({
            priority: 10,
            helpers: {
              findOverlay: function(elem) {
                return Ninja.tools.deriveElementsFrom(elem, configs.busyElement)
              }
            },
            events: {
              click:  function(evnt) {
                var overlay = Ninja.tools.busyOverlay(this.findOverlay(evnt.target))
                var submitter = Ninja.tools.ajaxSubmitter()
                submitter.action = evnt.target.href
                submitter.method = Ninja.tools.extractMethod(evnt.target)

                submitter.onResponse = function(xhr, statusTxt) {
                  overlay.remove()
                }
                overlay.affix()
                submitter.submit()						
              }
            }
          })
      },

      //Converts a form to send its request via Ajax - we assume that we get
      //Javascript back, which is eval'd.  We pull the method from the form:
      //either from the method attribute itself, a data-method attribute or a
      //Method input. While we're waiting, we'll throw up a busy overlay if
      //configured to do so.  By default, we use the form itself as the busy
      //element.
      //
      //Ninja.submitAsAjaxForm({
      //  busyElement: function(elem) { elem.parent }
      //})
      //
      submitsAsAjaxForm: function(configs) {
        if(!(configs instanceof Object)) {
          configs = { busyElement: undefined }
        }
        return new ninja.does({
            priority: 20,
            helpers: {
              findOverlay: function(elem) {
                return Ninja.tools.deriveElementsFrom(elem, configs.busyElement)
              }
            },
            events: {
              submit: function(evnt) {
                var overlay = Ninja.tools.busyOverlay(this.findOverlay(evnt.target))
                var submitter = Ninja.tools.ajaxSubmitter()
                submitter.formData = $(evnt.target).serializeArray()
                submitter.action = evnt.target.action
                submitter.method = Ninja.tools.extractMethod(evnt.target, submitter.formData)

                submitter.onResponse = function(xhr, statusTxt) {
                  overlay.remove()
                }
                overlay.affix()
                submitter.submit()
              }
            }
          })
      },


      //Converts a whole form into a link that submits via AJAX.  The intention
      //is that you create a <form> elements with hidden inputs and a single
      //submit button - then when we transform it, you don't lose anything in
      //terms of user interface.  Like submitsAsAjaxForm, it will put up a
      //busy overlay - by default we overlay the element itself
      //
      //this.becomesAjaxLink({
      //  busyElement: function(elem) { $("#user-notification") }
      //})
      becomesAjaxLink: function(configs) {
        if(!(configs instanceof Object)) {
          configs = { busyElement: undefined }
        }

        configs = Ninja.tools.ensureDefaults(configs, {
            busyElement: undefined,
            retainAttributes: ["id", "class", "lang", "dir", "title", "data-.*"]
          })

        return [ Ninja.submitsAsAjax(configs), Ninja.becomesLink(configs) ]
      },

      //Replaces a form with a link - the text of the link is based on the Submit
      //input of the form.  The form itself is pulled out of the document until
      //the link is clicked, at which point, it gets stuffed back into the
      //document and submitted, so the link behaves exactly link submitting the
      //form with its default inputs.  The motivation is to use hidden-input-only
      //forms for POST interactions, which Javascript can convert into links if
      //you want.
      becomesLink: function(configs) {
        configs = Ninja.tools.ensureDefaults(configs, {
            retainAttributes: ["id", "class", "lang", "dir", "title", "rel", "data-.*"]
          })

        return new ninja.does({
            priority: 30,
            transform: function(form){
              var linkText
              if ((images = $('input[type=image]', form)).size() > 0){
                image = images[0]
                linkText = "<img src='" + image.src + "' alt='" + image.alt +"'";
              } 
              else if((submits = $('input[type=submit]', form)).size() > 0) {
                submit = submits[0]
                if(submits.size() > 1) {
                  log("Multiple submits.  Using: " + submit)
                }
                linkText = submit.value
              } 
              else {
                log("Couldn't find a submit input in form");
              }

              var link = $("<a rel='nofollow' href='#'>" + linkText + "</a>")
              Ninja.tools.copyAttributes(form, link, configs.retainAttributes)
              this.stash($(form).replaceWith(link))
              return link
            },
            events: {
              click: function(evnt, elem){
                this.cascadeEvent("submit")
              }
            }
          })

      },

      //Use for elements that should be transient.  For instance, the default
      //behavior of failed AJAX calls is to insert a message into a
      //div#messages with a "flash" class.  You can use this behavior to have3A2
      //those disappear after a few seconds.
      //
      //Configs:
      //{ lifetime: 10000, diesFor: 600 }

      decays: function(configs) {
        if(typeof configs == "undefined") { configs = {} }

        if(typeof configs.lifetime == "undefined") {
          configs.lifetime = 10000
        }

        if(typeof configs.diesFor == "undefined") {
          configs.diesFor = 600
        }

        return new ninja.does({
            priority: 100,
            transform: function(elem) {
              $(elem).delay(configs.lifetime).slideUp(configs.diesFor, function(){
                  $(elem).remove()})
            },
            events: {
              click:  function(evnt, elem) {
                $(elem).remove();
              }
            }
          })
      }
    };
  }

  Ninja.packageBehaviors(standardBehaviors)
})();


//This exists to carry over interfaces from earlier versions of Ninjascript.  Likely, it will be removed from future versions of NinjaScript
( function($) {
    $.extend(
      {
        ninja: Ninja,
        behavior: Ninja.behavior
      }
    );
  }
)(jQuery);
