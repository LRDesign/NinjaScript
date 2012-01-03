define(["ninja", "utils"],
  function(Ninja, Utils) {
    var log = Utils.log
    Ninja.packageBehaviors( function(ninja){
      return {
        /**
         * Ninja.submitsAsAjax(configs) -> null
         * - configs(Object): configuration for the behavior, passed directly 
         *   to either submitsAsAjaxLink or submitsAsAjaxForm
         *
         * Converts either a link or a form to send its requests via AJAX - we
         * eval the Javascript we get back.  We get an busy overlay if 
         * configured to do so.
         * 
         * This farms out the actual behavior to submitsAsAjaxLink and
         * submitsAsAjaxForm, c.f.
         **/
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


        /**
         * Ninja.submitAsAjaxLink( configs ) -> null
         *
         * Converts a link to send its GET request via Ajax - we assume that we
         * get Javascript back, which is eval'd.  While we're waiting, we'll
         * throw up a busy overlay if configured to do so.  By default, we don't
         * use a busy overlay.
         * 
         **/
        submitsAsAjaxLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: function(elem) {
                return $(elem).parents('address,blockquote,body,dd,div,p,dl,dt,table,form,ol,ul,tr')[0]
              }})
          if(!configs.actions) {
            configs.actions = configs.expectsJSON
          }
 
          return new ninja.does({
              priority: 10,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                click:  function(evnt) {
                  this.overlayAndSubmit(evnt.target, evnt.target.href, configs.actions)
                }
              }
            })
        },

        /** 
         * Ninja.submitAsAjaxForm(configs) -> null
         *
         * Converts a form to send its request via Ajax - we assume that we get
         * Javascript back, which is eval'd.  We pull the method from the form:
         * either from the method attribute itself, a data-method attribute or a
         * Method input. While we're waiting, we'll throw up a busy overlay if
         * configured to do so.  By default, we use the form itself as the busy
         * element.
         * 
         **/ 
        submitsAsAjaxForm: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: undefined })

          if(!configs.actions) {
            configs.actions = configs.expectsJSON
          }

          return new ninja.does({
              priority: 10,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                submit: function(evnt) {
                  this.overlayAndSubmit(evnt.target, evnt.target.action, configs.actions)
                }
              }
            })
        },


        /** 
         * Ninja.becomesAjaxLink( configs ) -> null
         * 
         * Converts a whole form into a link that submits via AJAX.  The
         * intention is that you create a <form> elements with hidden inputs and
         * a single submit button - then when we transform it, you don't lose
         * anything in terms of user interface.  Like submitsAsAjaxForm, it will
         * put up a busy overlay - by default we overlay the element itself
         **/
        becomesAjaxLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              busyElement: undefined,
              retainedFormAttributes: ["id", "class", "lang", "dir", "title", "data-.*"]
            })

          return [ Ninja.submitsAsAjax(configs), Ninja.becomesLink(configs) ]
        },

        /** 
         * Ninja.becomesLink( configs ) -> null
         *
         * Replaces a form with a link - the text of the link is based on the
         * Submit input of the form.  The form itself is pulled out of the
         * document until the link is clicked, at which point, it gets stuffed
         * back into the document and submitted, so the link behaves exactly
         * link submitting the form with its default inputs.  The motivation is
         * to use hidden-input-only forms for POST interactions, which
         * Javascript can convert into links if you want.
         *
         **/
        becomesLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              retainedFormAttributes: ["id", "class", "lang", "dir", "title", "rel", "data-.*"]
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
                this.copyAttributes(form, link, configs.retainedFormAttributes)
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

        /** 
         * Ninja.decay( configs ) -> null
         *
         * Use for elements that should be transient.  For instance, the
         * default behavior of failed AJAX calls is to insert a message into a
         * div#messages with a "flash" class.  You can use this behavior to
         * have those disappear after a few seconds.
         * 
         * Configs: { lifetime: 10000, diesFor: 600 }
         **/

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
    })
  })
