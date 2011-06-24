define(["ninja"],
  function(Ninja) {
    Ninja.packageBehaviors( function(ninja){
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
  })
})
