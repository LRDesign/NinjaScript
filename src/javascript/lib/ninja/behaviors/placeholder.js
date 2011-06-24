/*
 * HTML5 introduces a very handy feature: placeholder text for inputs etc.
 * However, not all browsers support placeholder text yet.
 * And of course, if we make the feature JS, it does degrade gracefully.
 *
 * So, here's the plan:
 *
 * - Associate and element with an input - a label, or a note or whatever
 *   a la: 
 *     <label for="id1">Text</label><input type='text' id='id1'/> 
 *     or
 *     <input type='text' id='id1' /><span data-for='id1'>Text</span>
 *
 * - Ninjascript's first pass is to yoink the associated label and make it the
 *   placeholder text.
 *
 * - NS second pass is to make placeholder text actual placeholder if it's not
 *   available in the browser.
 *   = That means: do whatever it takes to make the input "placeholder"
 *     + text is just styled default
 *     + likewise textareas
 *     + password is crazytown
 *   = Some inputs maybe want a placeholdering, even when placeholder doesn't
 *     have an effect: 
 *     + selects (and maybe radio buttons) get an extra option
 *     + file entry?
 *
 *   = The submitter needs to clear the inputs if they still have "placeholder"
 *     values
 **/

(function($){

    // These are handlers for old browsers that don't suport placeholder yet
    function uiBehaviors(ninja){
      function placeholderSubmitter(inputBehavior) {
        return new ninja.does({
            priority: 1000,
            submit: [function(event, el, oldHandler) {
                inputBehavior.prepareForSubmit()
                oldHandler(event)
              }, "andDoDefault"]
          })
      }

    function grabsPlaceholderText(configs) {
      configs = Ninja.tools.ensureDefaults(configs, {
          idref_attr: "data-for",
          findText: function(elem) {
            var textHolder = $("*[" + configs.idref_attr + "=" + elem.id + "]")
            if(textHolder.length == 0) {
              return null
            }
            return textHolder[0]
          }
        })

      return new ninja.does({
          priority: -10,
          transform: function(element) {
            var label = $(configs.findText(element))
            if( label === null ) {
              this.cantTransform()
            }
            this.placeholderText = label.text()
            $(element).attr("placeholder", label.text())
            this.stash(label.detach())
          }
        })
    }

    //Gratefully borrowed from Modernizr

    var input_placeholder = !!('placeholder' in document.createElement('input'))
    var textarea_placeholder = !!('placeholder' in document.createElement('textarea'))

    if(! input_placeholder) {
      function hasPlaceholderPassword(configs) {
        configs = Ninja.tools.ensureDefaults(configs, {
            findParentForm: function(elem) {
              return elem.parents('form')[0]
            },
            retainAttributes: [
              "id", "class", "style", "title", "lang", "dir", 
              "size", "maxlength", "alt", "tabindex", "accesskey",
              "data-.*"
            ]
          })
        return new ninja.does({
            priority: 1000,
            helpers: {
              prepareForSubmit: function() {
                if($(this.element).attr('type') == 'text') {
                  $(this.element).val('')
                }
              }
            },
            transform: function(element) {
              var replacement
              var el = $(element)

              try {
                replacement = el.clone().attr({ type: 'text' })
              } catch(e) {
                replacement = $('<input>').attr({ type: 'text' })
                this.copyAttributes(element, replacement, configs.retainAttributes)
              }
              replacement.addClass("ninja_placeholder")
              this.stash(el.replaceWith(replacement))

              this.applyBehaviors(configs.findParentForm(el), [placeholderSubmitter(this)])
              return element
            },
            events: {
              focus: function(event) {
                this.stash($(this.element).replaceWith(this.unstash()))
              },
              blur: function(event) {
                this.stash($(this.element).replaceWith(this.unstash()))
              }
            }
          })
      }
    }

    if((!input_placeholder) || (!textarea_placeholder)) {
        function hasPlaceholderText(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              findParentForm: function(elem) {
                return elem.parents('form')[0]
              }
            })
          return new ninja.does({
              priority: 1000,
              helpers: {
                prepareForSubmit: function() {
                  if($(this.element).hasClass('ninja_placeholder')) {
                    $(this.element).val('')
                  }
                }
              },
              transform: function(element) {
                var el = $(element)
                el.addClass('ninja_placeholder')
                el.val(this.placeholderText)

                this.applyBehaviors(configs.findParentForm(el), [placeholderSubmitter(this)])

                return element
              },
              events: {
                focus: function(event) {
                  if($(this.element).hasClass('ninja_placeholder')) {
                    $(this.element).removeClass('ninja_placeholder').val('')
                  }
                },
                blur: function(event) {
                  if($(this.element).val() == '') {
                    $(this.element).addClass('ninja_placeholder').val(this.placeholderText)
                  }
                }
              }
            })
        }
      }

    return {
      hasPlaceholder: function(configs) {
        var behaviors = [grabsPlaceholderText(configs)]
        if(!input_placeholder || !textarea_placeholder) {
          behaviors.push(
            new ninja.chooses(function(meta) {
                if(input_placeholder) {
                  meta.asTextInput = null
                  meta.asPassword = null
                } else {
                  meta.asTextInput = hasPlaceholderText(configs)
                  meta.asPassword = hasPlaceholderPassword(configs)
                }

                if( textarea_placeholder) {
                  meta.asTextArea = null
                } else { 
                  meta.asTextArea = hasPlaceholderText(configs)
                }
              },
              function(elem) {
                elem = $(elem)
                if(elem.is("input[type=text]")) {
                  return this.asTextInput
                }
                else if(elem.is("textarea")) {
                  return this.asTextArea
                }
                else if(elem.is("input[type=password]")) {
                  return this.asPassword
                }
              }))
        }
        return behaviors
      }
    }
  }

  Ninja.packageBehaviors(uiBehaviors)
})(jQuery);
