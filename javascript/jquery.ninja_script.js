// vim: sw=2 ft=javascript
(function($) {
  // START READING HERE
  var Ninja = {
    //Stock behaviors
    //Converts a link to send its GET request via Ajax - we assume that we get
    //Javascript back, which is eval'd.  While we're waiting, we'll throw up a
    //busy overlay if configured to do so.  By default, we don't use a busy overlay.
    //
    //$.ninja.submit_as_ajax_link({
    //  busy_element: function(elem) { elem.parent }
    //})
    //
    submits_as_ajax_link: function(configs) {
      if(typeof configs == "undefined") { configs = {} }
      if(typeof configs.busy_element == "undefined") {
        configs.busy_element = function(elem) {}
      }

      return new Behavior({
        helpers: {
          find_overlay: configs.busy_element
        },
        events: {
          click:  function(evnt) {
            var overlay = $.ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
            var submitter = $.ninja.tools.ajax_submitter(evnt.target)

            submitter.response_handler = function() {
              return function(xhr, statusTxt) {
                if (typeof overlay != "undefined") { overlay.remove() }
                Ninja.tools.fire_mutation_event()
              }
            }
            if (typeof overlay != "undefined") { $("body").append(overlay) }
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
    //$.ninja.submit_as_ajax_form({
    //  busy_element: function(elem) { elem.parent }
    //})
    //
    submits_as_ajax_form: function(configs) {
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
            var overlay = $.ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
            var submitter = $.ninja.tools.ajax_submitter(evnt.target)

            submitter.response_handler = function() {
              return function(xhr, statusTxt) {
                overlay.remove()
                Ninja.tools.fire_mutation_event()
              }
            }
            $("body").append(overlay)
            submitter.submit()
          }
        }
      })
    },

    //Converts a whole form into a link that submits via AJAX.  The intention
    //is that you create a <form> elements with hidden inputs and a single
    //submit button - then when we transform it, you don't lose anything in
    //terms of user interface.  Like submits_as_ajax_form, it will put up a
    //busy overlay - by default we use the element's parent.
    //
    //$.ninja.becomes_ajax_link({
    //  busy_element: function(elem) { $("#user-notification") }
    //})
    becomes_ajax_link: function(configs) {
      if(typeof configs == "undefined") {
        configs = {}
      }

      if(typeof configs.busy_element == "undefined") {
        configs.busy_element = function(elem) {
          return elem.parentNode
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
          var jq_form = $(form)
          var attrs= ["id", "class", "lang", "dir", "title"].reduce(function(atts, att, idx, arry) {
            var att_val = jq_form.attr(att)
            if(typeof att_val !== "undefined" && att_val.length > 0) {
              atts[att] = att_val
            }
            return atts
          }, {})
          link.attr(attrs)

          this.submitter = $.ninja.tools.ajax_submitter(form)
          this.submitter.response_handler = function() {
            var submitter = this
            return function(xhr, statusTxt) {
              submitter.overlay.remove()
              Ninja.tools.fire_mutation_event()
            }
          }

          $(form).replaceWith(link)
          return link
        },
        events: {
          click: function(evnt, elem){
            var overlay = $.ninja.tools.busy_overlay(this.helpers.find_overlay(evnt.target))
            this.submitter.overlay = overlay
            $("body").append(overlay)
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
    //  decaying blocks (recoverable?)
    //  dynamic validation?
    //  autocomplete    
    //  observe_form / observe_field
    //  links  (link_to_remote)


    //NinjaScript-wide configurations.  Currently, not very many
    config: {
      //This is the half-assed
      message_wrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      message_list: "#messages",
      use_jquery_live: true
    },
    mutation_targets: [],
    tools: {
      add_mutation_targets: function(targets) {
        Ninja.tools.mutation_targets = Ninja.tools.mutation_targets.concat(target)
      },
      fire_mutation_event: function() {
        var targets = Ninja.mutation_targets
        if (targets.length > 0 ) {
          for(var target = targets.shift(); 
          targets.length > 0; 
          target = targets.shift()) {
            $(target).trigger("NinjaChangedDOM")
          }
        }
        else {
          $(document.firstChild).trigger("NinjaChangedDOM")
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
      busy_overlay: function(elem) {
        if (typeof elem != "undefined") {
          var overlay = this.build_overlay_for(elem)
          overlay.addClass("ninja busy")
          return overlay
        }	
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
        var adding_message = Ninja.config.message_wrapping(text, classes)
        $(Ninja.config.message_list).append(adding_message)
      }
    }

  }

  //Below here is the Ninja dojo - the engines that make NinjaScript work.
  //With any luck, only the helpful and curious should have call to keep
  //reading

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

  Ninja.behavior = Behavior

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
      while (this.event_queue.length != 0){
        var target = this.event_queue[0].target
        var use_target = true
        this.event_queue = this.event_queue.filter(function(val, idx, queue) {
          if(idx == 0) {
            return true 
          }
          use_target = use_target && !($.contains(val.target, target))
          return !($.contains(target, val))
        })
        if(use_target){
          this.apply(target)
        }
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
    }

    this.dataType = 'script'

    if(element.dataset != undefined) {
      if(element.dataset["method"] != undefined && 
      element.dataset["method"].length > 0) {
        this.method = element.dataset["method"]
      }
    }
    else if($(element).attr("data-method") != undefined) {
      this.method = element.dataset["method"]
    }
    else {
      for(var i=0, len = this.form_data.length; i<len; i++) {
        if(this.form_data[i].name == "_method") {
          this.method = this.form_data[i].value
          break
        }
      }
    }

    return this
  }

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
      //jQuery "helpfully" does this for us
      //var response = eval(data)
    },
    on_error: function(xhr, statusTxt, errorThrown) {
      console.log(xhr.responseText)
      $.ninja.tools.message("Server error: " + xhr.statusText, "error")
    }
  }


  function handleMutation(evnt) {
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
      //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
      //hack, so nerf it
      $("html").one("DOMSubtreeModified DOMNodeInserted", function(){
        Ninja.tools.fire_mutation_event = function(){}
        Ninja.tools.add_mutation_targets = function(t){}
      })
      $(function(){ Ninja.tools.fire_mutation_event(); });
    }
  });
})(jQuery);
