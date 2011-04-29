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
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: function(elem) {
                return $(elem).parents('address,blockquote,body,dd,div,p,dl,dt,table,form,ol,ul,tr')[0]
              }})

          return new ninja.does({
              priority: 10,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                click:  function(evnt) {
                  var overlay = this.busyOverlay(this.findOverlay(evnt.target))
                  var submitter = this.ajaxSubmitter()
                  submitter.action = evnt.target.href
                  submitter.method = this.extractMethod(evnt.target)

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
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: undefined })

          return new ninja.does({
              priority: 20,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                submit: function(evnt) {
                  var overlay = this.busyOverlay(this.findOverlay(evnt.target))
                  var submitter = this.ajaxSubmitter()
                  submitter.formData = jQuery(evnt.target).serializeArray()
                  submitter.action = evnt.target.action
                  submitter.method = this.extractMethod(evnt.target, submitter.formData)

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
        //  busyElement: function(elem) { jQuery("#user-notification") }
        //})
        becomesAjaxLink: function(configs) {
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
                if ((images = jQuery('input[type=image]', form)).size() > 0){
                  image = images[0]
                  linkText = "<img src='" + image.src + "' alt='" + image.alt +"'";
                } 
                else if((submits = jQuery('input[type=submit]', form)).size() > 0) {
                  submit = submits[0]
                  if(submits.size() > 1) {
                    log("Multiple submits.  Using: " + submit)
                  }
                  linkText = submit.value
                } 
                else {
                  log("Couldn't find a submit input in form");
                  this.cantTransform()
                }

                var link = jQuery("<a rel='nofollow' href='#'>" + linkText + "</a>")
                this.copyAttributes(form, link, configs.retainAttributes)
                this.stash(jQuery(form).replaceWith(link))
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
        //{ lifetime: 10000, diesFor: 600 }

        decays: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              lifetime: 10000,
              diesFor: 600
            })

          return new ninja.does({
              priority: 100,
              transform: function(elem) {
                jQuery(elem).delay(configs.lifetime).slideUp(configs.diesFor, function(){
                    jQuery(elem).remove()
                    Ninja.tools.fireMutationEvent()
                  })
              },
              events: {
                click:  [function(event) {
                    jQuery(this.element).remove();
                  }, "changesDOM"]
              }
            })
        }
      };
    }

    Ninja.packageBehaviors(standardBehaviors)
  })();