goog.provide('ninjascript.packagedBehaviors.placeholder');

goog.require('ninjascript.plugin');

(function() {
    var behaviors = {}

    behaviors.placeholderSubmitter = function(inputBehavior) {
      return new this.types.does({
          priority: 1000,
          submit: [function(event, el, oldHandler) {
              inputBehavior.prepareForSubmit()
              oldHandler(event)
            }, "andDoDefault"]
        })
    }

    behaviors.grabsPlaceholderText = function(configs) {
      configs = this.tools.ensureDefaults(configs, {
          textElementSelector: function(elem) {
            return "*[data-for=" + elem.id + "]"
          },
          findTextElement: function(elem) {
            var textHolder = $(configs.textElementSelector(elem))
            if(textHolder.length == 0) {
              return null
            }
            return textHolder[0]
          }
        })

      return new this.types.does({
          priority: -10,
          transform: function(element) {
            var label = $(configs.findTextElement(element))
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
      behaviors.alternateInput = function(passwordField, parentForm) {
        return new this.types.does({
            helpers: {
              prepareForSubmit: function() {
                $(this.element).val('')
              }
            },
            transform: function() {
              this.applyBehaviors(parentForm, [placeholderSubmitter(this)])
            },
            events: {
              focus: function(event) {
                var el = $(this.element)
                var id = el.attr("id")
                el.attr("id", '')
                el.replaceWith(passwordField)
                passwordField.attr("id", id)
                passwordField.focus()
              }
            }
          })
      }

      behaviors.hasPlaceholderPassword = function(configs) {
        var configs = this.tools.ensureDefaults(configs, {
            findParentForm: function(elem) {
              return elem.parents('form')[0]
            },
            retainedInputAttributes: [
              "name", "class", "style", "title", "lang", "dir",
              "size", "maxlength", "alt", "tabindex", "accesskey",
              "data-.*"
            ]
          })
        return new this.types.does({
            priority: 1000,
            helpers: {
              swapInAlternate: function() {
                var el = $(this.element)
                var id = el.attr("id")
                if(el.val() == '') {
                  el.attr("id", '')
                  el.replaceWith(this.placeholderTextInput)
                  this.placeholderTextInput.attr('id', id)
                }
              }
            },
            transform: function(element) {
              var replacement
              var el = $(element)

              replacement = $('<input type="text">')
              this.copyAttributes(element, replacement, configs.retainedInputAttributes)
              replacement.addClass("ninja_placeholder")
              replacement.val(this.placeholderText)

              var alternate = alternateInput(el, configs.findParentForm(el))
              this.applyBehaviors(replacement, [alternate])

              this.placeholderTextInput = replacement
              this.swapInAlternate()

              return element
            },
            events: {
              blur: function(event) {
                this.swapInAlternate()
              }
            }
          })
      }
    }

    if((!input_placeholder) || (!textarea_placeholder)) {
      behaviors.hasPlaceholderText = function(configs) {
        var configs = this.tools.ensureDefaults(configs, {
            findParentForm: function(elem) {
              return elem.parents('form')[0]
            }
          })
        return new this.types.does({
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

    behaviors.hasPlaceholder = function(configs) {
      var behaviors = [this.grabsPlaceholderText(configs)],
      asTextInput = null,
      asPassword = null,
      asTextArea = null

      if(!input_placeholder || !textarea_placeholder) {
        if(!input_placeholder) {
          asTextInput = this.hasPlaceholderText(configs)
          asPassword = this.hasPlaceholderPassword(configs)
        }

        if( !textarea_placeholder) {
          asTextArea = this.hasPlaceholderText(configs)
        }

        behaviors.push(
          new this.types.chooses(
            function(elem) {
              elem = $(elem)
              if(elem.is("input[type=text]")) {
                return asTextInput
              }
              else if(elem.is("textarea")) {
                return asTextArea
              }
              else if(elem.is("input[type=password]")) {
                return asPassword
              }
            }))
      }
      return behaviors
    }

    ninjascript.plugin( function(hooks){
        hooks.Ninja(behaviors)
      })
  })()
