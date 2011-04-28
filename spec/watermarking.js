describe("Watermarking", function() {
    var formData
    beforeEach(function() {
        formData = []

        Ninja.tools.clearRootCollection()
        Ninja.behavior({
            "#form_a": {
              priority: -10,
              submit: function(event) {
                formData = $(this.element).serializeArray()
              }
            },
            "#input_a": Ninja.isWatermarked,
            "#pass_c": Ninja.isWatermarked
          })
        Ninja.go()
        setFixtures( "<form id='form_a' action='#' method='PUT'>" +
            "<label id='label_a' for='input_a'>INPUT A!</label>" +
            "<input id='input_a' name='a' type='text' />" +
            "<label id='label_b' for='input_b'>INPUT B!</label>" +
            "<input id='input_b' name='b' type='text' />" +
            "<label id='label_c' for='pass_c'>PASSWORD</label>" +
            "<input id='pass_c' name='c' type='password' />" +
            "</form>" 
        )
      })
    xdescribe("on the form", function() {
        it("should still trigger previous handlers", function() {
            expect(formData.length).toEqual(0)
            $('#form_a').trigger('submit')
            expect(formData.length).toEqual(3)
          })

        it("should clear inputs before submitting", function() {
            $('#form_a').trigger('submit')
            expect(formData.map(function(itm) {
                  return itm.value
                })).not.toContain("INPUT A!")
          })

        describe("after inputs have been changed", function() {
          beforeEach(function() {
              $("#input_a").trigger("focus")
              $("#input_a").val("test a")
              $("#input_a").trigger("blur")
              $("#input_b").trigger("focus")
              $("#input_b").val("test b")
              $("#input_b").trigger("blur")
            })

          it("should retain user input", function() {
            $('#form_a').trigger('submit')
            expect(formData.map(function(itm) {
                  return itm.value
                })).toContain("test a")
            expect(formData.map(function(itm) {
                  return itm.value
                })).toContain("test b")
          })
        })
      })
    
    describe("on inputs", function() {
        it("input should have default val() set", function() {
            expect($('#input_a').val()).toEqual("INPUT A!")
          })

        it("input should have .ninja_watermarked class", function() {
            expect($('#input_a.ninja_watermarked')).toExist()
          })

        it("label should have .ninja_watermarked class", function() {
            expect($('#label_a.ninja_watermarked')).toExist()
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

            it("should not have .ninja_watermarked class", function() {
                expect($('#input_a.ninja_watermarked')).not.toExist()
              })

            it("label should have .ninja_watermarked class", function() {
                expect($('#label_a.ninja_watermarked')).toExist()
              })

            describe("when loses focus with input", function() {
                beforeEach(function() {
                    $('#input_a').val("Some input")
                    $('#input_a').trigger('blur')
                  })

                it("should retain user input", function() {
                    expect($('#input_a').val()).toEqual("Some input")
                  })

                it("should not have .ninja_watermarked class", function() {
                    expect($('#input_a.ninja_watermarked')).not.toExist()
                  })

                it("label should have .ninja_watermarked class", function() {
                    expect($('#label_a.ninja_watermarked')).toExist()
                  })
              })

            describe("and loses focus without input", function() {
                beforeEach(function() {
                    $('#input_a').trigger('blur')
                  })

                it("input should have default val() set", function() {
                    expect($('#input_a').val()).toEqual("INPUT A!")
                  })

                it("input should have .ninja_watermarked class", function() {
                    expect($('#input_a.ninja_watermarked')).toExist()
                  })

                it("label should have .ninja_watermarked class", function() {
                    expect($('#label_a.ninja_watermarked')).toExist()
                  })
              })
          })
      })

  })

