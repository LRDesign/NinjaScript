describe("Packaged Behaviors:", function() {
    var Ninja
    var sandbox
    beforeEach(function(){
        Ninja = ninjascript.build()
      })

    describe("becomesAjaxLink()", function() {

        beforeEach(function() {
            Ninja.behavior({
                "#simple-form": Ninja.becomesAjaxLink()
              })
            Ninja.go()
            setFixtures( fixtures.simpleForm('packaged') + fixtures.ajaxTarget)
            sandbox = sinon.sandbox.create()
            sandbox.useFakeServer()
            Ninja.tools.fireMutationEvent()
          })

        afterEach(function(){
            sandbox.restore()
          })

        it("should transform the form into a link", function() {
            expect($("form#simple-form")).not.toExist()
            expect($("a#simple-form")).toExist()
          })

        describe("handling clicking the link", function() {
            var response
            beforeEach(function() {
                response = [
                  200,
                  {"Content-Type": "text/javascript"},
                  fixtures.scriptResponse
                ]
              })

            afterEach(function() {
                for(var i in sandbox.server.requests) {
                  sandbox.server.requests[i].respond(response)
                }
              })


            it("should handle clicking the link to send a post", function() {
                expect(sandbox.server.requests.length).toEqual(0)
                $("a#simple-form").trigger("click")
                expect(sandbox.server.requests.length).toEqual(1)
                expect(sandbox.server.requests[0].method).toEqual("PUT")
              })

            it("should put up an overlay", function() {
                expect($("div.ninja_busy")).not.toExist()
                $("a#simple-form").trigger("click")
                expect($("div.ninja_busy")).toExist()
                sandbox.server.requests[0].respond(response)
                expect($("div.ninja_busy")).not.toExist()
              })

            it("should apply the reply javascript", function() {
                $("a#simple-form").trigger("click")
                expect($("#ajax-target > *").length).toEqual(0)
                sandbox.server.requests[0].respond(response)
                expect($("#ajax-target > *").length).toEqual(3)
              })
          })
      })
  })




// vim: set sw=2 ft=javascript.jasmine-javascript:
