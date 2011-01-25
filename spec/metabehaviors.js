describe("Metabehaviors", function() {
    var response
    beforeEach(function() {
        Ninja.tools.clearRootCollection()
        setFixtures(fixtures.simpleForm('metabehaviors') + fixtures.simpleLink + fixtures.ajaxTarget + "<table><tr><td id='shouldnt-ajax'</td></tr></table>")
        $('#simple-form').bind("submit", function(){return false})
        Ninja.behavior({
            "#simple-form": Ninja.submitsAsAjax(),
            "#simple-link": Ninja.submitsAsAjax(),
            '#shouldnt-ajax': Ninja.submitsAsAjax()
          })
        Ninja.go()
        response = {
          status: 200,
          contentType: "text/javascript",
          responseText: fixtures.scriptResponse
        }
        mockAjax()
      })

    afterEach(function() { 
        for(var i in ajaxRequests) {
          ajaxRequests[i].response(response)
        }
      })

    it("should handle click", function() {
        expect(ajaxRequests.length).toEqual(0)
        $("a#simple-link").trigger("click")
        expect(ajaxRequests.length).toEqual(1)
      })

    it("should handle submit", function() {
        expect(ajaxRequests.length).toEqual(0)
        $("form#simple-form").trigger("submit")
        expect(ajaxRequests.length).toEqual(1)
      })

    it("should leave non-ajaxy things alone", function() {
        expect($("#shouldnt-ajax").length).toEqual(1)
      })
  })

