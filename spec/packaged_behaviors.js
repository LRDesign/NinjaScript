describe("Packaged Behaviors:", function() {
    var Ninja
    var sandbox
    beforeEach(function(){
        Ninja = ninjascript.build()
        sandbox = sinon.sandbox.create()
      })

    afterEach(function(){
        Ninja.stop()
        sandbox.restore()
      })

    describe("becomesAjaxLink()", function() {

        beforeEach(function() {
            Ninja.behavior({
                "#simple-form": Ninja.becomesAjaxLink()
              })
            Ninja.go()
            setFixtures( fixtures.simpleForm('packaged') + fixtures.ajaxTarget)
            sandbox.useFakeServer()
            Ninja.tools.fireMutationEvent()
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
                  sandbox.server.requests[i].respond(response[0], response[1], response[2])
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
                sandbox.server.requests[0].respond(response[0], response[1], response[2])
                expect($("div.ninja_busy")).not.toExist()
              })

            it("should apply the reply javascript", function() {
                $("a#simple-form").trigger("click")
                expect($("#ajax-target > *").length).toEqual(0)
                sandbox.server.requests[0].respond(response[0], response[1], response[2])
                expect($("#ajax-target > *").length).toEqual(3)
              })
          })
      })


    describe("confirms()", function() {
        beforeEach(function(){
            Ninja.behavior({
                "#confirmable-checkbox": Ninja.confirms({confirmMessage: "Are you sure you want to check this?"})
              })
            Ninja.go()
            setFixtures( fixtures.confirmingCheckbox )
            Ninja.tools.fireMutationEvent()
          })

        it("should allow action if confirmed", function(){
            var mockWindow = sandbox.mock(window)
            mockWindow.expects("confirm").atLeast(1).withArgs("Are you sure you want to check this?").returns(true)

            $("input#confirmable-checkbox").trigger("click")
            expect($("#confirmable-checkbox:checked").length).toEqual(1)
          })

        it("should cancel action if not confirmed", function(){
            var mockWindow = sandbox.mock(window)
            mockWindow.expects("confirm").atLeast(1).withArgs("Are you sure you want to check this?").returns(false)

            $("input#confirmable-checkbox").trigger("click")
            expect($("#confirmable-checkbox:checked").length).toEqual(0)
          })
      })
  })




// vim: set sw=2 ft=javascript.jasmine-javascript:
