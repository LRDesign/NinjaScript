describe("Metabehaviors", function() {
    var Ninja

    var response
    var sandbox
    beforeEach(function() {
        Ninja = ninjascript.build()

        document.body.innerHTML =
          __html__["spec_support/fixtures/simple-form.html"] +
          __html__["spec_support/fixtures/simple-link.html"] +
          __html__["spec_support/fixtures/not-ajax-table.html"];

        $('#simple-form').bind("submit", function(){return false})
        Ninja.behavior({
            "#simple-form": Ninja.submitsAsAjax(),
            "#simple-link": Ninja.submitsAsAjax(),
            '#shouldnt-ajax': Ninja.submitsAsAjax()
          })
        Ninja.go()
        sandbox = sinon.sandbox.create()
        sandbox.useFakeServer()
      })

    afterEach(function() {
        for(var i in sandbox.server.requests) {
          sandbox.server.requests[i].respond(
            200,
            {"Content-Type": "text/javascript"},
            __html__["spec_support/fixtures/script-response.js"]
          )
        }

        sandbox.restore()
        Ninja.stop()
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

    it("should handle multiple submits", function() {
        expect(sandbox.server.requests.length).toEqual(0)
        $("form#simple-form").trigger("submit")
        expect(sandbox.server.requests.length).toEqual(1)
        $("form#simple-form").trigger("submit")
        expect(sandbox.server.requests.length).toEqual(2)
      });

    it("should leave non-ajaxy things alone", function() {
        expect($("#shouldnt-ajax").length).toEqual(1)
      })
  })
