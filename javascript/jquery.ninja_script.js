// vim: sw=2
(function($) {
  function Behavior(handlers) {
    this.helpers = {}
    this.event_handlers = []
    this.use_live = Ninja.use_jquery_live

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

        $(elem).data("ninja-behaviors", true)
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
    apply: function(elem) {
      if (!$(elem).data("ninja_behaviors")) {
        new this.in_context(elem).apply(elem)
      }
    },
    make_handler: function(config) {
      var behavior = this
      var handle
      var stop_default = true
      var stop_propagate = true
      var stop_immediate = true
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

  function BehaviorCollection() {
    this.event_queue = []
    this.behaviors = []
    return this
  }

  BehaviorCollection.prototype = {
    add_behavior: function(selector, behavior) {
      this.behaviors.push([selector, behavior])
    },
    event_triggered: function(evnt){
      if(this.event_queue.length == 0){
        this.event_queue.unshift(evnt)
        this.handle_queue()
      }
      else {
        this.event_queue.unshift(evnt)
      }
    },
    handle_queue: function(){
      //compacting the queue - should reduce overlapping like events to a single event.
      while (this.event_queue.length != 0){
        this.event_queue = [this.event_queue[0]]
        this.apply(this.event_queue.pop());
      }
    },
    apply: function(evnt){
      var i
      var root = evnt.target
      var len = this.behaviors.length
      for(i = 0; i < len; i++) {
        var pair = this.behaviors[i]
        var selector = pair[0]
        var behavior = pair[1]
        $(root).find(selector).each( function(index, elem){
          if (!$(elem).data("ninja_behaviors")) {
            behavior.apply(elem)
          }
        })
      }
    }
  }

  function AjaxSubmitter(form_data, action, method) {
    this.form_data = form_data
    this.action = action
    this.method = method
    this.dataType = 'script'

    var method_fields = $.grep(form_data, function(pair) {
      return (pair.name == "_method");
    });
    if ( method_fields.length > 0 ){
      this.method = method_fields[0].value;
    }

    return this
  }

  //Possibly, this should be just $.ajax with complex ajax_data
  AjaxSubmitter.prototype = {
    submit: function() {
      $.ajax(this.ajax_data())
    },

    ajax_data: function() {
      return {
        data: this.form_data,
        dataType: this.dataType,
        url: this.action,
        type: this.method,
        complete: this.response_handler,
        success: this.success_handler,
        error: this.on_error,
        submitter: this
      }
    },
    success_handler: function(data, statusTxt, xhr) {
      this.submitter.on_success(xhr, statusTxt, data)
    },
    response_handler: function(xhr, statusTxt) {
      this.submitter.on_response(xhr, statusTxt)
      Ninja.tools.fire_mutation_event()
    },

    on_response: function(xhr, statusTxt) {
    },
    on_success: function(xhr, statusTxt, data) {
      var response = eval(data)
    },
    on_error: function(xhr, statusTxt, errorThrown) {
      console.log(xhr.responseText)
      $.ninja.tools.message("Server error: " + xhr.statusText, "error")
    }
  }

  var Ninja = {
    config: {
      message_wrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      message_list: "#messages",
      use_jquery_live: true
    },
    tools: {
      fire_mutation_event: function() {
        $(document.firstChild).trigger("NinjaChangedDOM");
      },
      suppress_change_events: function() {
        return new Behavior({
          events: {
            DOMSubtreeModified: function(e){},
            DOMNodeInserted: function(e){}
          }
        })
      },
      ajax_submitter: function(form_data, action, method) {
        return new AjaxSubmitter(form_data, action, method)
      },
      busy_overlay: function(elem) {
        var overlay = this.build_overlay_for(elem)
        overlay.addClass("ninja busy")
        return overlay
      },

      //Currently, this doesn't respect changes to the original block...
      //Also certain elements (which ones are poorly understood) evade correct overlay
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
        var adding_message = Ninja.config.message_wrapping(text, classes)
        $(Ninja.config.message_list).append(adding_message)
      }
    },

    //Stock behaviors
    //Wishlist:
    //  tooltip
    //  watermarking
    //  rounded corners
    //  block drop shadow
    //  text -> image
    //  image redboxing
    //  table sorting
    //  decaying blocks (recoverable?)
    //  dynamic validation?
    //  autocomplete

    ajax_submission: function(configs) {
      if(typeof configs == "undefined") {
        configs = {}
      }

      if(typeof configs.busy_element == "undefined") {
        configs.busy_element = function(elem) {
          return elem
        }
      }
      return new Behavior({
        helpers: {
          find_overlay: configs.busy_element
        },
        events: {
          submit: function(evnt) {
            var form_data = $(evnt.target).serializeArray()
            var overlay = $.ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
            var submitter = $.ninja.tools.ajax_submitter(form_data, 
            evnt.target.action, 
            evnt.target.method)
            submitter.on_response = function(x,t) {
              overlay.remove()
            }
            $("body").append(overlay)
            submitter.submit()
          }
        }
      })
    },
    make_ajax_link: function(configs) {
      if(typeof configs == "undefined") {
        configs = {}
      }

      if(typeof configs.busy_element == "undefined") {
        configs.busy_element = function(elem) {
          return elem
        }
      }
      return new Behavior({
        helpers: {
          find_overlay: configs.busy_element
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
          this.form_data = $(form).serializeArray()
          this.action = form.action
          this.method = form.method

          $(form).replaceWith(link)
          return link
        },
        events: {
          click: function(evnt, elem){
            var overlay = $.ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
            var submitter = $.ninja.tools.ajax_submitter( this.form_data, this.action, this.method)
            submitter.on_response = function(x,t) {
              overlay.remove()
            }
            $("body").append(overlay)
            submitter.submit()
          }
        }
      })
    }
  }

  function handleMutation(evnt) {
    //TODO Queue up re-applications
    //TODO Restrict application to changed part of subtree

    $(this).data("ninja-behavior").event_triggered(evnt);
  }

  $.extend({
    ninja: Ninja,
    behavior: function(dispatching) 
    {
      var collection = new BehaviorCollection()
      var selector
      for(selector in dispatching) 
      {
        if(typeof dispatching[selector] == "undefined") 
        {
          console.log("Selector " + selector + " not properly defined - ignoring")
        } 
        else 
        {
          if(dispatching[selector] instanceof Behavior) 
          {
            collection.add_behavior(selector, dispatching[selector])
          } 
          else 
          {
            var behavior = new Behavior(dispatching[selector])
            collection.add_behavior(selector, behavior)
          }
        }
      }
      $("html").data("ninja-behavior", collection);
      $("html").bind("DOMSubtreeModified DOMNodeInserted NinjaChangedDOM", handleMutation);
      $("html").one("DOMSubtreeModified DOMNodeInserted", function(){
        Ninja.tools.fire_mutation_event = function(){}
      })
      $(function(){ Ninja.tools.fire_mutation_event(); });
    }
  });
})(jQuery);
