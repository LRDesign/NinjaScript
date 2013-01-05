describe("Metabehaviors", function() {
    var Ninja

    var response
    var sandbox
    beforeEach(function() {
        Ninja = ninjascript.build()

        setFixtures(fixtures.simpleForm('metabehaviors') + fixtures.simpleLink + fixtures.ajaxTarget + "<table><tr><td id='shouldnt-ajax'</td></tr></table>")
        $('#simple-form').bind("submit", function(){return false})
        Ninja.behavior({
            "#simple-form": Ninja.submitsAsAjax(),
            "#simple-link": Ninja.submitsAsAjax(),
            '#shouldnt-ajax': Ninja.submitsAsAjax()
          })
        Ninja.go()
        response = [
          200,
          {"Content-Type": "text/javascript"},
          fixtures.scriptResponse
        ]
        sandbox = sinon.sandbox.create()
        sandbox.useFakeServer()
      })

    afterEach(function() {
        for(var i in sandbox.server.requests) {
          sandbox.server.requests[i].respond(response)
        }

        sandbox.restore()
      })

    it("should handle click", function() {
        expect(sandbox.server.requests.length).toEqual(0)
        $("a#simple-link").trigger("click")
        expect(sandbox.server.requests.length).toEqual(1)
      })

    it("should handle submit", function() {
        expect(sandbox.server.requests.length).toEqual(0)
        $("form#simple-form").trigger("submit")
        expect(sandbox.server.requests.length).toEqual(1)
      })

    it("should leave non-ajaxy things alone", function() {
        expect($("#shouldnt-ajax").length).toEqual(1)
      })
  })
