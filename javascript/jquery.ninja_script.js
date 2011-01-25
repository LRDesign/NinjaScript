// vim: sw=2 ft=javascript

function buildNinja() {
  function log(message) {
    try {
      console.log(message)
    }
    catch(e) {} //we're in IE or FF w/o Firebug or something
  }

  /*
  //Still trying to decide if I want to do this, or wrap a global function
  if(typeof Array.prototype.forEach == "undefined") {
    //Trying to cover for IE - adapted from ECMA 2.6.2 5th Ed.
    Array.prototype.forEach = function(callback, thisArg) {
      var len = Number(this.length)
      for(var k = 0; k < len; k+=1) {
        if(typeof this[k] != "undefined") {
          callback.call(thisArg, this[k], k, this)
        }
      }
    }
  }
  */

  function forEach(list, callback, thisArg) {
    if(typeof list.forEach == "function") {
      list.forEach(callback, thisArg)
    }
    else {
      var len = Number(list.length)
      for(var k = 0; k < len; k+=1) {
        if(typeof list[k] != "undefined") {
          callback.call(thisArg, list[k], k, list)
        }
      }
    }
  }

  function NinjaScript() {
    //NinjaScript-wide configurations.  Currently, not very many
    this.config = {
      //This is the half-assed: it should be template of some sort
      message_wrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      message_list: "#messages",
      busy_laziness: 200
    }


    this.tools = new Tools(this)
  }

  NinjaScript.prototype = {
    // START READING HERE
    //Stock behaviors

    //Converts either a link or a form to send its requests via AJAX - we eval
    //the Javascript we get back.  We get an busy overlay if configured to do
    //so.
    //
    //This farms out the actual behavior to submits_as_ajax_link and
    //submits_as_ajax_form, c.f.
    submits_as_ajax: function(configs) {
      return new Metabehavior(function(meta) {
          meta.as_link = Ninja.submits_as_ajax_link(configs),
          meta.as_form = Ninja.submits_as_ajax_form(configs)
        },
        function(elem) {
          switch(elem.tagName.toLowerCase()) {
          case "a": return this.as_link
          case "form": return this.as_form
          }
        })
    },


    //Converts a link to send its GET request via Ajax - we assume that we get
    //Javascript back, which is eval'd.  While we're waiting, we'll throw up a
    //busy overlay if configured to do so.  By default, we don't use a busy
    //overlay.
    //
    //Ninja.submit_as_ajax_link({
    //  busy_element: function(elem) { elem.parent }
    //})
    //
    submits_as_ajax_link: function(configs) {
      if(!(configs instanceof Object)) {
        configs = { busy_element: undefined }
      }
      return new Behavior({
          helpers: {
            find_overlay: function(elem) {
              return Ninja.tools.derive_elements_from(elem, configs.busy_element)
            }
          },
          events: {
            click:  function(evnt) {
              var overlay = Ninja.tools.busy_overlay(this.find_overlay(evnt.target))
              var submitter = Ninja.tools.ajax_submitter()
              submitter.action = evnt.target.href
              submitter.method = Ninja.tools.extractMethod(evnt.target)

              submitter.on_response = function(xhr, statusTxt) {
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
    //_method input. While we're waiting, we'll throw up a busy overlay if
    //configured to do so.  By default, we use the form itself as the busy
    //element.
    //
    //Ninja.submit_as_ajax_form({
    //  busy_element: function(elem) { elem.parent }
    //})
    //
    submits_as_ajax_form: function(configs) {
      if(!(configs instanceof Object)) {
        configs = { busy_element: undefined }
      }
      return new Behavior({
          helpers: {
            find_overlay: function(elem) {
              return Ninja.tools.derive_elements_from(elem, configs.busy_element)
            }
          },
          events: {
            submit: function(evnt) {
              var overlay = Ninja.tools.busy_overlay(this.find_overlay(evnt.target))
              var submitter = Ninja.tools.ajax_submitter()
              submitter.form_data = $(evnt.target).serializeArray()
              submitter.action = evnt.target.action
              submitter.method = Ninja.tools.extractMethod(evnt.target, submitter.form_data)

              submitter.on_response = function(xhr, statusTxt) {
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
    //terms of user interface.  Like submits_as_ajax_form, it will put up a
    //busy overlay - by default we overlay the element itself
    //
    //this.becomes_ajax_link({
    //  busy_element: function(elem) { $("#user-notification") }
    //})
    becomes_ajax_link: function(configs) {
      if(!(configs instanceof Object)) {
        configs = { busy_element: undefined }
      }

      return [ Ninja.submits_as_ajax(configs), Ninja.becomes_link() ]
    },

    //Replaces a form with a link - the text of the link is based on the Submit
    //input of the form.  The form itself is pulled out of the document until
    //the link is clicked, at which point, it gets stuffed back into the
    //document and submitted, so the link behaves exactly link submitting the
    //form with its default inputs.  The motivation is to use hidden-input-only
    //forms for POST interactions, which Javascript can convert into links if
    //you want.
    becomes_link: function() {
      return new Behavior({
          transform: function(form){
            var link_text
            if ((images = $('input[type=image]', form)).size() > 0){
              image = images[0]
              link_text = "<img src='" + image.src + "' alt='" + image.alt +"'";
            } 
            else if((submits = $('input[type=submit]', form)).size() > 0) {
              submit = submits[0]
              if(submits.size() > 1) {
                log("Multiple submits.  Using: " + submit)
              }
              link_text = submit.value
            } 
            else {
              log("Couldn't find a submit input in form");
            }

            var link = $("<a href='#'>" + link_text + "</a>")
            var jq_form = $(form)
            var attrs= ["id", "class", "lang", "dir", "title"].reduce(
              function(atts, att, idx, arry) {
                var att_val = jq_form.attr(att)
                if(typeof att_val !== "undefined" && att_val.length > 0) {
                  atts[att] = att_val
                }
                return atts
              }, {})
            link.attr(attrs)

            this.stash(jq_form.replaceWith(link)) // I think this'll nix baseForm
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
    //div#messages with a "flash" class.  You can use this behavior to have
    //those disappear after a few seconds.
    //
    //Configs:
    //{ lifetime: 10000, dies_for: 600 }

    decays: function(configs) {
      if(typeof configs == "undefined") { configs = {} }

      if(typeof configs.lifetime == "undefined") {
        configs.lifetime = 10000
      }

      if(typeof configs.dies_for == "undefined") {
        configs.dies_for = 600
      }

      return new Behavior({
          transform: function(elem) {
            $(elem).delay(configs.lifetime).slideUp(configs.dies_for, function(){
                $(elem).remove()})
          },
          events: {
            click:  function(evnt, elem) {
              $(elem).remove();
            }
          }
        })
    },

    //Wishlist:
    //  tooltip
    //  watermarking
    //  rounded corners
    //  block drop shadow
    //  text -> image
    //  image redboxing
    //  table sorting
    //  paginated table sorting (AJAX backend)
    //  dynamic validation?
    //  autocomplete    
    //  observe_form / observe_field

    behavior: function(dispatching) {
      var collection = this.tools.get_root_collection()
      for(var selector in dispatching) 
      {
        if(typeof dispatching[selector] == "undefined") {
          log("Selector " + selector + " not properly defined - ignoring")
        } 
        else {
          collection.addBehavior(selector, dispatching[selector])
        }
      }
      $(function(){ Ninja.tools.fire_mutation_event(); });
    }
  }


  function Tools(ninja) {
    this.ninja = ninja
    this.mutation_targets = []
  }

  Tools.prototype = {
    add_mutation_targets: function(targets) {
      this.mutation_targets = this.mutation_targets.concat(target)
    },
    get_root_of_document: function() {
      return $("html") //document.firstChild)
    },
    fire_mutation_event: function() {
      var targets = this.mutation_targets
      if (targets.length > 0 ) {
        for(var target = targets.shift(); 
          targets.length > 0; 
          target = targets.shift()) {
          $(target).trigger("thisChangedDOM")
        }
      }
      else {
        this.get_root_of_document().trigger("thisChangedDOM")
        //$("html").trigger("thisChangedDOM")
      }
    },
    clear_root_collection: function() {
      this.get_root_of_document().data("ninja-behavior", null)
    },
    get_root_collection: function() {
      var rootOfDocument = this.get_root_of_document()
      if(rootOfDocument.data("ninja-behavior") instanceof BehaviorCollection) {
        return rootOfDocument.data("ninja-behavior")
      }

      var collection = new BehaviorCollection()
      rootOfDocument.data("ninja-behavior", collection);
      rootOfDocument.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
      //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
      //hack, so nerf it
      rootOfDocument.one("DOMSubtreeModified DOMNodeInserted", function(){
          this.fire_mutation_event = function(){}
          this.add_mutation_targets = function(t){}
        })
      return collection
    },
    derive_elements_from: function(element, means){
      switch(typeof means){
      case 'undefined': return element
      case 'string': return $(means)
      case 'function': return means(element)
      }
    },
    suppress_change_events: function() {
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
      Ninja.tools.get_root_collection().applyBehaviorsTo(hide, [Ninja.tools.suppress_change_events()])
      return hide
    },
    ajax_submitter: function(form) {
      return new AjaxSubmitter(form)
    },
    overlay: function() {
      // I really liked using 
      //return new Overlay([].map.apply(arguments,[function(i) {return i}]))
      //but IE8 doesn't implement ECMA 2.6.2 5th ed.
      
      return new Overlay(jQuery.makeArray(arguments))
    },
    busy_overlay: function(elem) {
      var overlay = this.overlay(elem)
      overlay.set.addClass("ninja busy")
      overlay.laziness = this.ninja.config.busy_laziness
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
          if(formData[i].name == "_method") {
            log("Override via _method: " + formData[i].value)
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
    build_overlay_for: function(elem) {
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
      var adding_message = this.ninja.config.message_wrapping(text, classes)
      $(this.ninja.config.message_list).append(adding_message)
    }
  }

  var Ninja = new NinjaScript();
  //Below here is the dojo - the engines that make NinjaScript work.
  //With any luck, only the helpful and curious should have call to keep
  //reading
  //

  function handleMutation(evnt) {
    Ninja.tools.get_root_collection().mutation_event_triggered(evnt);
  }

  function AjaxSubmitter() {
    this.form_data = []
    this.action = "/"
    this.method = "GET"
    this.dataType = 'script'

    return this
  }

  AjaxSubmitter.prototype = {
    submit: function() {
      log("Computed method: " + this.method)
      $.ajax(this.ajax_data())
    },

    ajax_data: function() {
      return {
        data: this.form_data,
        dataType: this.dataType,
        url: this.action,
        type: this.method,
        complete: this.response_handler(),
        success: this.success_handler(),
        error: this.on_error
      }
    },

    success_handler: function() {
      var submitter = this
      return function(data, statusTxt, xhr) {
        submitter.on_success(xhr, statusTxt, data)
      }
    },
    response_handler: function() {
      var submitter = this
      return function(xhr, statusTxt) {
        submitter.on_response(xhr, statusTxt)
        Ninja.tools.fire_mutation_event()
      }
    },

    on_response: function(xhr, statusTxt) {
    },
    on_success: function(xhr, statusTxt, data) {
    },
    on_error: function(xhr, statusTxt, errorThrown) {
      log(xhr.responseText)
      Ninja.tools.message("Server error: " + xhr.statusText, "error")
    }
  }

  function Overlay(list) {
    var elements = this.convert_to_element_array(list)
    this.laziness = 0
    var ov = this
    this.set = $(jQuery.map(elements, function(element, idx) {
          return ov.build_overlay_for(element)
        }))
  }

  Overlay.prototype = {
    convert_to_element_array: function(list) {
      var h = this
      switch(typeof list) {
      case 'undefined': return []
      case 'boolean': return []
      case 'string': return h.convert_to_element_array($(list))
      case 'function': return h.convert_to_element_array(list())
      case 'object': {
          //IE8 barfs on 'list instanceof Element'
          if("focus" in list && "blur" in list && !("jquery" in list)) {
            return [list]
          }
          else if("length" in list && "0" in list) {
            var result = []
            forEach(list, function(element) {
                result = result.concat(h.convert_to_element_array(element))
              })
            return result
          }
          else {
            return []
          }
        }
      }
    },

    build_overlay_for: function(elem) {
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
      overlay_set = this.set
      window.setTimeout(function() {
          overlay_set.css("display", "block")
        }, this.laziness)
    },
    remove: function() {
      this.set.remove()
    }
  }

  function BehaviorCollection() {
    this.lexicalCount = 0
    this.event_queue = []
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
        this.handlers[eventName] = function(event_record) {
          handler(event_record)
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
      for(var eventName in behavior.event_handlers) {
        var oldHandler = this.handlers[eventName]
        if(typeof oldHandler == "undefined") {
          oldHandler = function(){}
        }
        this.handlers[eventName] = behavior.buildHandler(context, eventName, oldHandler)
      }
    },
    applyEventHandlers: function(element) {
      for(var event_name in this.handlers) {
        $(element).bind(event_name, this.handlers[event_name])
      }
    }
  }

  TRANSFORM_FAILED = {}

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
      if(Array.isArray(behavior)) {
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

    mutation_event_triggered: function(evnt){
      if(this.event_queue.length == 0){
        log("mutation event - first")
        this.enqueue_event(evnt)
        this.handle_queue()
      }
      else {
        log("mutation event - queueing")
        this.enqueue_event(evnt)
      }
    },
    enqueue_event: function(evnt) {
      var event_covered = false
      var uncovered = []
      forEach(this.event_queue, function(val) {
          event_covered = event_covered || $.contains(val.target, evnt.target)
          if (!($.contains(evnt.target, val.target))) {
            uncovered.push(val)
          }
        })
      if(!event_covered) {
        uncovered.unshift(evnt)
        this.event_queue = uncovered
      } 
    },
    handle_queue: function(){
      while (this.event_queue.length != 0){
        this.applyAll(this.event_queue[0].target)
        this.event_queue.shift()
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
          //try {
            curContext = behavior.inContext(context)
            element = behavior.applyTransform(curContext, element)

            context = curContext
            context.element = element

            scribe.recordEventHandlers(context, behavior)
//          }
//          catch(ex) {
//            if(ex === TRANSFORM_FAILED) {
//              log("!!! Transform failed")
//            }
//            else {
//              log(ex)
//              throw ex
//            }
//          }
        }
      )
      $(element).data("ninja-visited", true)

      scribe.applyEventHandlers(element)

      return element
    },
    collectBehaviors: function(element, collection, behaviors) {
      forEach(behaviors, function(val, idx, l) {
          collection.push(val.choose(element))
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
        var pair = this.behaviors[i]
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
      return this.chooser(element).choose(element)
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
    this.event_handlers = []
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
      this.event_handlers = handlers.events
    } 
    else {
      this.event_handlers = handlers
    }

    return this
  }
  Behavior.prototype = {   
    //XXX apply_to?
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
    inContext: function(based_on) {
      function Context() {}
      Context.prototype = based_on
      return this.enrich(new Context, this.helpers)
    },
    enrich: function(left, right) {
      return $.extend(left, right)
    },
    applyTransform: function(context, elem) {
      return this.transform.call(context, elem)
    },
    applyEventHandlers: function(context, elem) {
      for(var event_name in this.event_handlers) {
        var handler = this.event_handlers[event_name]
        $(elem).bind(event_name, this.make_handler.call(context, handler))
      }
      return elem
    },
    recordEventHandlers: function(scribe, context) {
      for(var event_name in this.event_handlers) {
        scribe.recordHandler(this, event_name, function(oldHandler){
            return this.make_handler.call(context, this.event_handlers[event_name], oldHandler)
          }
        )
      }
    },
    buildHandler: function(context, eventName, previousHandler) {
      var handle
      var stop_default = true
      var stop_propagate = true
      var stop_immediate = false
      var config = this.event_handlers[eventName]

      if (typeof config == "function") {
        handle = config
      }
      else {
        handle = config[0]
        config = config.slice(1,config.length)
        var len = config.length
        for(var i = 0; i < len; i++) {
          if (config[i] == "default") {
            stop_default = false
          }
          if (config[i] == "propagate") {
            stop_propagate = false
          }
          if (config[i] == "immediate" || config[i] == "other") {
            stop_immediate = false
          }
        }
      }
      var handler = function(event_record) {
        handle.call(context, event_record, this, previousHandler)
        return !stop_default
      }
      if(stop_default) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.preventDefault()
          })
      }
      if(stop_propagate) {
        handler = this.prependAction(handler, function(eventRecord) {
            eventRecord.stopPropagation()
          })
      }
      if (stop_immediate) {
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
};

Ninja = buildNinja();

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
