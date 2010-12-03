describe("Ninja.tools: ", function() {
  describe("derive elements from", function() {
    var start_element
    beforeEach(function() {
      setFixtures(fixtures.simple_form + fixtures.simple_link + fixtures.ajax_target)
      start_element = $("html")
    })
    
    it("should get using a string", function() {
      expect(Ninja.tools.derive_elements_from(start_element, "#simple_form")).toEqual($("#simple_form"))
    })

    it("should get using a function", function() {
      expect(Ninja.tools.derive_elements_from(start_element, function(elem) {return $(elem).children()})).toEqual($(start_element).children())
    })

    it("should treat undefined as an identity", function() {
      expect(Ninja.tools.derive_elements_from(start_element)).toEqual(start_element)
    })
  })
})

// vim: sw=2 ft=javascript.jasmine-javascript
