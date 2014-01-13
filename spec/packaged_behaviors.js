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

    describe("becomesAjaxLink() with a button submit", function() {
        beforeEach(function() {
            Ninja.behavior({
                "#simple-form": Ninja.becomesAjaxLink()
              });
            Ninja.go();
            document.body.innerHTML =
              __html__["spec_support/fixtures/button-form.html"] +
              __html__["spec_support/fixtures/ajax-target.html"];

            sandbox.useFakeServer();
            Ninja.tools.fireMutationEvent();
          });

        it("should transform the form into a link", function() {
            expect($("form#simple-form").length).toBe(0);
            expect($("a#simple-form").length).toBeGreaterThan(0);
          });
      });

    describe("becomesAjaxLink()", function() {

        beforeEach(function() {
            Ninja.behavior({
                "#simple-form": Ninja.becomesAjaxLink()
              })
            Ninja.go()
            document.body.innerHTML =
              __html__["spec_support/fixtures/simple-form.html"] +
              __html__["spec_support/fixtures/ajax-target.html"];

            sandbox.useFakeServer()
            Ninja.tools.fireMutationEvent()
          })

        it("should transform the form into a link", function() {
            expect($("form#simple-form").length).toBe(0);
            expect($("a#simple-form").length).toBeGreaterThan(0);
          })

        describe("handling clicking the link", function() {
            var response
            beforeEach(function() {
                response = [
                  200,
                  {"Content-Type": "text/javascript"},
                  __html__["spec_support/fixtures/script-response.js"]
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
                expect($("div.ninja_busy").length).toBe(0);
                $("a#simple-form").trigger("click")
                expect($("div.ninja_busy").length).toBeGreaterThan(0);
                sandbox.server.requests[0].respond(response[0], response[1], response[2])
                expect($("div.ninja_busy").length).toBe(0);
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
            document.body.innerHTML = __html__["spec_support/fixtures/confirming-checkbox.html"]
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

    describe("triggersOnSelect()", function(){
      })
  })




// vim: set sw=2 ft=javascript.jasmine-javascript:
