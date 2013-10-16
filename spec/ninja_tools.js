describe("Ninja.tools: ", function() {
    var Ninja
    beforeEach(function(){
        Ninja = ninjascript.build()
      })

    afterEach(function(){
        Ninja.stop()
      })

    describe("cant transform", function() {
        it("should raise a CantTransformException", function() {
            expect( function() {
                Ninja.tools.cantTransform("test exception")
              }).toThrow("test exception")
          })

      })


    describe("derive elements from", function() {
        var startElement
        beforeEach(function() {
            document.body.innerHTML =
              __html__["spec_support/fixtures/simple-form.html"] +
              __html__["spec_support/fixtures/simple-link.html"] +
              __html__["spec_support/fixtures/ajax-target.html"];

            startElement = $("html")
          })

        it("should get using a string", function() {
            expect(Ninja.tools.deriveElementsFrom(startElement, "#simpleForm")).toEqual($("#simpleForm"))
          })

        it("should get using a function", function() {
            expect(Ninja.tools.deriveElementsFrom(startElement, function(elem) {return $(elem).children()})).toEqual($(startElement).children())
          })

        it("should treat undefined as an identity", function() {
            expect(Ninja.tools.deriveElementsFrom(startElement)).toEqual(startElement)
          })
      })
  })

// vim: sw=2 ft=javascript.jasmine-javascript
