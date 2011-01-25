describe("Ninja.tools: ", function() {
  describe("derive elements from", function() {
    var startElement
    beforeEach(function() {
      setFixtures( '<form id="simple-form" action="/testing-ajax-link-tools" method="post">\
  <input type="hidden" name="Method" value="put"></input>\
  <input type="hidden" name="thing" value="16"></input>\
  <input type="submit" name="Submit!" value="To the Zod">\
</form>'+ fixtures.simpleLink + fixtures.ajaxTarget)
      //setFixtures(fixtures.simpleForm + fixtures.simpleLink + fixtures.ajaxTarget)
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
