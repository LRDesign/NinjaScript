

describe("Placeholding", function() {
    var input_placeholder = !!('placeholder' in document.createElement('input'))
    var textarea_placeholder = !!('placeholder' in document.createElement('textarea'))

    var formData
    beforeEach(function() {
        formData = "didn't trigger"

        Ninja.tools.clearRootCollection()
        Ninja.behavior({
            "#form_a": {
              priority: -10,
              submit: function(event) {
                console.log("Triggered submit handler")
                formData = $(this.element).serializeArray()
              }
            },
            "#input_a": Ninja.hasPlaceholder,
            "#input_d": Ninja.hasPlaceholder,
            "#pass_c": Ninja.hasPlaceholder
          })
        setFixtures( "<form onsubmit='console.log(\"submitting fixture form\");' id='form_a' action='/fail_on_purpose' method='PUT'>" +
            "<label id='label_a' for='input_a'>INPUT A!</label>" +
            "<input id='input_a' name='a' type='text' />" +
            "<label id='label_b' for='input_b'>INPUT B!</label>" +
            "<input id='input_b' name='b' type='text' />" +
            "<label id='label_d' for='input_d'>TEXTAREA!</label>" +
            "<textarea id='input_d' name='d' />" +
            "<label id='label_c' for='pass_c'>PASSWORD</label>" +
            "<input id='pass_c' name='c' type='password' />" +
            "</form>" 
        )
        Ninja.go()
      })

    describe("on the form", function() {
        it("should still trigger previous handlers", function() {
            expect(formData).toEqual("didn't trigger")
            $('#form_a').trigger('submit')
            expect(typeof formData).not.toEqual("string")
            expect(formData.length).toEqual(4)
          })

        it("should clear inputs before submitting", function() {
            $('#form_a').trigger('submit')
            expect(typeof formData).not.toEqual("string")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).not.toContain("INPUT A!")
            expect($.map(formData, function(itm) {
                  return itm.value
                })).not.toContain("PASSWORD")
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
            $('#form_a').trigger('submit')
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
              expect($('#label_a.ninja_placeholder')).toExist()
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
                  expect($('#label_a.ninja_placeholder')).toExist()
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
                      expect($('#label_a.ninja_placeholder')).toExist()
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
                      expect($('#label_a.ninja_placeholder')).toExist()
                    })
                })
            })
        }
    })

  })
