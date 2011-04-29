(function($){
    function uiBehaviors(ninja){
      function watermarkedSubmitter(inputBehavior) {
        return new ninja.does({
            priority: 1000,
            submit: [function(event, el, oldHandler) {
                inputBehavior.prepareForSubmit()
                oldHandler(event)
              }, "andDoDefault"]
          })
      }
      function isWatermarkedPassword(configs) {
        return new ninja.does({
            priority: 1000,
            helpers: {
              prepareForSubmit: function() {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).val('')
                }
              }
            },
            transform: function(element) {
              var label = $('label[for=' + $(element)[0].id + ']')
              if(label.length == 0) {
                this.cantTransform()
              }
              label.addClass('ninja_watermarked')
              this.watermarkText = label.text()

              var el = $(element)
              el.addClass('ninja_watermarked')
              el.val(this.watermarkText)
              el.attr("type", "text")

              this.applyBehaviors(el.parents('form')[0], [watermarkedSubmitter(this)])

              return element
            },
            events: {
              focus: function(event) {
                $(this.element).removeClass('ninja_watermarked').val('').attr("type", "password")
              },
              blur: function(event) {
                if($(this.element).val() == '') {
                  $(this.element).addClass('ninja_watermarked').val(this.watermarkText).attr("type", "text")
                }
              }
            }
          })
      }

      function isWatermarkedText(configs) {
        return new ninja.does({
            priority: 1000,
            helpers: {
              prepareForSubmit: function() {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).val('')
                }
              }
            },
            transform: function(element) {
              var label = $('label[for=' + $(element)[0].id + ']')
              if(label.length == 0) {
                this.cantTransform()
              }
              label.addClass('ninja_watermarked')
              this.watermarkText = label.text()
              var el = $(element)
              el.addClass('ninja_watermarked')
              el.val(this.watermarkText)

              this.applyBehaviors(el.parents('form')[0], [watermarkedSubmitter(this)])

              return element
            },
            events: {
              focus: function(event) {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).removeClass('ninja_watermarked').val('')
                }
              },
              blur: function(event) {
                if($(this.element).val() == '') {
                  $(this.element).addClass('ninja_watermarked').val(this.watermarkText)
                }
              }
            }
          })
      }

      return {
        isWatermarked: function(configs) {
          return new ninja.chooses(function(meta) {
              meta.asText = isWatermarkedText(configs)
              meta.asPassword = isWatermarkedPassword(configs)
            },
            function(elem) {
              if($(elem).is("input[type=text],textarea")) {
                return this.asText
              }
              //Seems IE has a thing about changing input types...
              //We'll get back to this one
              //              else if($(elem).is("input[type=password]")){
              //                return this.asPassword
              //              }
            })
        }
      }
    }

    Ninja.packageBehaviors(uiBehaviors)
  })(jQuery);
