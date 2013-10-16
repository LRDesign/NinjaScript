describe("Placeholding", function() {
    var Ninja

    var input_placeholder = !!('placeholder' in document.createElement('input'))
    var textarea_placeholder = !!('placeholder' in document.createElement('textarea'))

    var formData
    beforeEach(function() {
        Ninja = ninjascript.build()

        formData = "didn't trigger"
        Ninja.behavior({
            "#placeholder-form": {
              priority: -10,
              submit: function(event) {
                formData = $(this.element).serializeArray()
              }
            },
            "#input_a,#input_d,#pass_c": Ninja.hasPlaceholder
          })
        document.body.innerHTML = __html__["spec_support/fixtures/placeholder-form.html"]

        $('#placeholder-form').bind('submit', function(event){
                formData = $(this.element).serializeArray()
                event.preventDefault()
              })
        Ninja.go()
      })

    afterEach(function(){
        Ninja.stop()
      })

    describe("on the form", function() {
        it("should still trigger previous handlers", function() {
            expect(formData).toEqual("didn't trigger")
            $('#placeholder-form').trigger('submit')
            expect(typeof formData).not.toEqual("string")
            expect(formData.length).toEqual(4)
          })

        it("should clear inputs before submitting", function() {
            $('#placeholder-form').trigger('submit')
            expect(typeof formData).not.toEqual("string")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).not.toContain("INPUT A!")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).not.toContain("SECRET")
          })

        describe("after inputs have been changed", function() {
          beforeEach(function() {
              $("#input_a").trigger("focus")
              $("#input_a").val("test a")
              $("#input_a").trigger("blur")
              $("#input_b").trigger("focus")
              $("#input_b").val("test b")
              $("#input_b").trigger("blur")
              $("#pass_c").trigger("focus")
              $("#pass_c").val("password")
              $("#pass_c").trigger("blur")
            })

          it("should retain user input", function() {
            $('#placeholder-form').trigger('submit')
            expect(typeof formData).not.toEqual("string")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).toContain("test a")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).toContain("test b")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).toContain("password")
          })
        })
      })

    describe("on inputs", function() {
        //Need to check that placholder is set
        if(!input_placeholder) {
          it("input should have default val() set", function() {
              expect($('#input_a').val()).toEqual("INPUT A!")
            })

          it("input should have .ninja_placeholder class", function() {
              expect($('#input_a.ninja_placeholder')).toExist()
            })

          it("label should have .ninja_placeholder class", function() {
              expect($('#label_a')).not.toExist()
            })

          xit("passwords should become text", function() {
              expect($('#pass_c[type=text]')).toExist()
            })

          xdescribe("when password focused", function() {
              it("should become password again", function() {
                  expect($('#pass_c[type=password]')).toExist()
                })
            })

          describe("when focused", function() {
              beforeEach(function() {
                  $('#input_a').trigger('focus')
                })

              it("should not have default text", function() {
                  expect($('#input_a').val()).toEqual("")
                })

              it("should not have .ninja_placeholder class", function() {
                  expect($('#input_a.ninja_placeholder')).not.toExist()
                })

              it("label should have .ninja_placeholder class", function() {
                  expect($('#label_a')).not.toExist()
                })

              describe("when loses focus with input", function() {
                  beforeEach(function() {
                      $('#input_a').val("Some input")
                      $('#input_a').trigger('blur')
                    })

                  it("should retain user input", function() {
                      expect($('#input_a').val()).toEqual("Some input")
                    })

                  it("should not have .ninja_placeholder class", function() {
                      expect($('#input_a.ninja_placeholder')).not.toExist()
                    })

                  it("label should have .ninja_placeholder class", function() {
                      expect($('#label_a')).not.toExist()
                    })
                })

              describe("and loses focus without input", function() {
                  beforeEach(function() {
                      $('#input_a').trigger('blur')
                    })

                  it("input should have default val() set", function() {
                      expect($('#input_a').val()).toEqual("INPUT A!")
                    })

                  it("input should have .ninja_placeholder class", function() {
                      expect($('#input_a.ninja_placeholder')).toExist()
                    })

                  it("label should have .ninja_placeholder class", function() {
                      expect($('#label_a')).not.toExist()
                    })
                })
            })
        }
    })

  })
