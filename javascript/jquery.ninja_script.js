// vim: sw=2 ft=javascript

function buildNinja() {
  function NinjaScript() {
    //NinjaScript-wide configurations.  Currently, not very many
    this.config = {
      //This is the half-assed: it should be template of some sort
      message_wrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      message_list: "#messages",
      use_jquery_live: true,
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
          case "a": return this.as_link.apply(elem)
          case "form": return this.as_form.apply(elem)
          }
        })
    },

    //Converts a link to send its GET request via Ajax - we assume that we get
    //Javascript back, which is eval'd.  While we're waiting, we'll throw up a
    //busy overlay if configured to do so.  By default, we don't use a busy overlay.
    //
    //this.submit_as_ajax_link({
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
              var overlay = Ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
              var submitter = Ninja.tools.ajax_submitter(evnt.target)

              submitter.on_response = function(xhr, statusTxt) {
                overlay.remove()
              }
              overlay.affix()
              submitter.submit()						
            }
          }
        })
    },

    //Converts a form to send its request via Ajax - we assume that we getv
    //Javascript back, which is eval'd.  We pull the method from the form:
    //either from the method attribute itself, a data-method attribute or a
    //_method input. While we're waiting, we'll throw up a busy overlay if
    //configured to do so.  By default, we use the form itself as the busy
    //element.
    //
    //this.submit_as_ajax_form({
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
              var overlay = Ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
              var submitter = Ninja.tools.ajax_submitter(evnt.target)

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
    //busy overlay - by default we use the element
    //
    //this.becomes_ajax_link({
    //  busy_element: function(elem) { $("#user-notification") }
    //})
    becomes_ajax_link: function(configs) {
      if(!(configs instanceof Object)) {
        configs = { busy_element: undefined }
      }
      return new Behavior({
          helpers: {
            find_overlay: function(elem) {
              return Ninja.tools.derive_elements_from(elem, configs.busy_element)
            }
          },
          transform: function(form){
            var link_text
            if ((images = $('input[type=image]', form)).size() > 0){
              image = images[0]
              link_text = "<img src='" + image.src + "' alt='" + image.alt +"'";
            } 
            else if((submits = $('input[type=submit]', form)).size() > 0) {
              submit = submits[0]
              link_text = submit.value
            } 
            else {
              console.log("Couldn't find a submit input in form");
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

            this.submitter = Ninja.tools.ajax_submitter(form)
            this.submitter.on_response = function(xhr, statusTxt) {
              this.overlay.remove()
            }

            $(form).replaceWith(link)
            return link
          },
          events: {
            click: function(evnt, elem){
              var overlay = Ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
              this.submitter.overlay = overlay
              overlay.affix()
              this.submitter.submit()
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
    //  dynamic validation?
    //  autocomplete    
    //  observe_form / observe_field

    behavior: function(dispatching) {
      var collection = this.tools.get_root_collection()
      for(var selector in dispatching) 
      {
        if(typeof dispatching[selector] == "undefined") {
          console.log("Selector " + selector + " not properly defined - ignoring")
        } 
        else {
          if(dispatching[selector] instanceof Behavior) {
            collection.add_behavior(selector, dispatching[selector])
          } 
          else if(dispatching[selector] instanceof Metabehavior) {
            collection.add_behavior(selector, dispatching[selector])
          }
          else {
            var behavior = new Behavior(dispatching[selector])
            collection.add_behavior(selector, behavior)
          }
        }
      }
      $(function(){ Ninja.tools.fire_mutation_event(); });
    },

  }


  function Tools(ninja) {
    this.ninja = ninja
    this.mutation_targets = []
  }

  Tools.prototype = {
    add_mutation_targets: function(targets) {
      this.mutation_targets = this.mutation_targets.concat(target)
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
        $(document.firstChild).trigger("thisChangedDOM")
      }
    },
    clear_root_collection: function() {
      $("html").data("ninja-behavior", null)
    },
    get_root_collection: function() {
      if($("html").data("ninja-behavior") instanceof BehaviorCollection) {
        return $("html").data("ninja-behavior")
      }

      var collection = new BehaviorCollection()
      $("html").data("ninja-behavior", collection);
      $("html").bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
      //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
      //hack, so nerf it
      $("html").one("DOMSubtreeModified DOMNodeInserted", function(){
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
    ajax_submitter: function(form) {
      return new AjaxSubmitter(form)
    },
    overlay: function() {
      return new Overlay([].map.apply(arguments,[function(i) {return i}]))
    },
    busy_overlay: function(elem) {
      var overlay = this.overlay(elem)
      overlay.set.addClass("ninja busy")
      overlay.laziness = this.ninja.config.busy_laziness
      return overlay
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
  //Below here is the this dojo - the engines that make NinjaScript work.
  //With any luck, only the helpful and curious should have call to keep
  //reading
  //

  function handleMutation(evnt) {
    Ninja.tools.get_root_collection().mutation_event_triggered(evnt);
  }

  function AjaxSubmitter(element) {
    if(element.tagName.toLowerCase() == 'a') {
      this.form_data = []
      this.action = element.href
      this.method = "GET"
    } 
    else {
      this.form_data = $(element).serializeArray()
      this.action = element.action
      this.method = element.method
      console.log("Element method: " + element.method)
    }

    this.dataType = 'script'

    if(element.dataset !== undefined && 
      element.dataset["method"] !== undefined && 
      element.dataset["method"].length > 0) {
      console.log("Override via dataset: " + element.dataset["method"])
      this.method = element.dataset["method"]
    }
    else if(element.dataset === undefined && 
      $(element).attr("data-method") !== undefined) {
      console.log("Override via data-method: " + $(element).attr("data-method"))
      this.method = $(element).attr("data-method")
    }
    else {
      for(var i=0, len = this.form_data.length; i<len; i++) {
        if(this.form_data[i].name == "_method") {
          console.log("Override via _method: " + this.form_data[i].value)
          this.method = this.form_data[i].value
          break
        }
      }
    }

    return this
  }

  AjaxSubmitter.prototype = {
    submit: function() {
      console.log("Computed method: " + this.method)
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
        error: this.on_error,
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
      console.log(xhr.responseText)
      Ninja.tools.message("Server error: " + xhr.statusText, "error")
    }
  }

  function Overlay(list) {
    var elements = this.convert_to_element_array(list)
    this.laziness = 0
    this.set = $(elements.map(function(element, idx, list) {
          return this.build_overlay_for(element)
        }, this))
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
          if(list instanceof Element) {
            return [list]
          }
          else if("length" in list && "0" in list) {
            var result = Array.prototype.reduce.apply(list, [function(newlist, element, idx, list) {
                  return newlist.concat(h.convert_to_element_array(element))
                }, []])
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
    this.event_queue = []
    this.behaviors = []
    return this
  }

  BehaviorCollection.prototype = {
    add_behavior: function(selector, behavior) {
      this.behaviors.push([selector, behavior])
    },


    mutation_event_triggered: function(evnt){
      if(this.event_queue.length == 0){
        //console.log("mutation event - first")
        this.enqueue_event(evnt)
        this.handle_queue()
      }
      else {
        //console.log("mutation event - queueing")
        this.enqueue_event(evnt)
      }
    },
    enqueue_event: function(evnt) {
      var event_covered = false
      var uncovered = this.event_queue.filter(function(val, idx, queue) {
          event_covered = event_covered || $.contains(val.target, evnt.target)
          return !($.contains(evnt.target, val.target))
        })
      if(!event_covered) {
        uncovered.unshift(evnt)
        this.event_queue = uncovered
      } 
    },
    handle_queue: function(){
      while (this.event_queue.length != 0){
        this.apply(this.event_queue[0].target)
        this.event_queue.shift()
      }
    },

    apply: function(root){
      var i
      var len = this.behaviors.length
      for(i = 0; i < len; i++) {
        var pair = this.behaviors[i]
        var selector = pair[0]
        var behavior = pair[1]
        $(root).find(selector).each( function(index, elem){
            if (!$(elem).data("ninja-behaviors")) {
              behavior.apply(elem)
            }
          })
      }
    }
  }

  function Metabehavior(setup, callback) {
    setup(this)
    this.application = callback
  }

  Metabehavior.prototype = {
    apply: function(elem) {
      if (!$(elem).data("ninja-visited")) {
        this.application(elem)
        $(elem).data("ninja-visited", true)
      }
    }
  }

  function Behavior(handlers) {
    this.helpers = {}
    this.event_handlers = []
    this.use_live = this.use_jquery_live

    if (typeof handlers.transform == "function") {
      this.transform = handlers.transform
      delete handlers.transform
    }
    if (typeof handlers.helpers != "undefined"){
      this.helpers = handlers.helpers
      delete handlers.helpers
    }
    if (typeof handlers.use_live != "undefined"){
      this.use_live = handlers.use_live
      delete handlers.use_live
    }

    if (typeof handlers.events != "undefined") {
      this.event_handlers = handlers.events
    } 
    else {
      this.event_handlers = handlers
    }

    var applier = function() {
      this.apply = function(element) {
        var elem = this.transform(element)

        $(elem).data("ninja-visited", true)

        var len = this.handlers.length
        for(var i = 0; i < len; i++) {
          var event_name = this.handlers[i][0]
          var handler = this.handlers[i][1]
          $(elem).bind(event_name, handler)
        }
        delete this.handlers
      }
    }
    applier.prototype = this

    this.in_context = function(elem) {
      var element = elem
      this.handlers = []

      // If this can make it's way to Behavior(instead of two deep) we
      // can make huge mem savings
      for(var event_name in this.event_handlers) {
        var handler = this.event_handlers[event_name]
        this.handlers.push([event_name, this.make_handler(handler)])
      }

      return this
    }
    this.in_context.prototype = new applier()

    return this
  }
  Behavior.prototype = {   
    //XXX apply_to?
    apply: function(elem) {
      if (!$(elem).data("ninja-visited")) {
        new this.in_context(elem).apply(elem)
      }
    },
    make_handler: function(config) {
      var behavior = this
      var handle
      var stop_default = true
      var stop_propagate = true
      var stop_immediate = false
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
      return function(event_record) {
        if (stop_default) {
          event_record.preventDefault()
        }
        if (stop_propagate) {
          event_record.stopPropagation()
        }
        if (stop_immediate) {
          event_record.stopImmediatePropagation()
        }
        handle.apply(behavior, [event_record, this])
        return !stop_default
      }
    },
    transform: function(elem){ 
      return elem 
    }
  }

  return Ninja;  
};

//More than a bit of a hack
if(typeof(console) === 'undefined') {
  console = {
    log: function(){}
  }
}

var Ninja = buildNinja();

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
