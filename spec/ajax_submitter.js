// vim: set sw=2 ft=javascript.jasmine-javascript:
describe("AjaxSubmitter", function() {
    var Ninja
    var submitter
    var sandbox
    beforeEach(function() {
        Ninja = ninjascript.build()
      })

    afterEach(function(){
        Ninja.stop()
      })

    describe("applied to a link", function() {
        beforeEach(function() {

            document.body.innerHTML =
              __html__["spec_support/fixtures/simple-link.html"] +
              __html__["spec_support/fixtures/ajax-target.html"];
            submitter = Ninja.tools.ajaxSubmitter($('#simple-link')[0])

            sandbox = sinon.sandbox.create()
            sandbox.useFakeServer()
          })

        afterEach(function() {
            sandbox.restore()
          })


        it("should send an ajax request on .submit()", function() {
            expect(sandbox.server.requests.length).toEqual(0)
            submitter.submit()
            expect(sandbox.server.requests.length).toEqual(1)
          })

        it("should apply the resulting javascript", function() {
            expect($("#ajax-target > *").length).toEqual(0)
            submitter.submit()
            sandbox.server.requests[0].respond(
                  200,
                  {"Content-Type": "text/javascript"},
                  __html__["spec_support/fixtures/script-response.js"]
                )
            expect($("#ajax-target > *").length).toEqual(3)
          })
      })

    describe("applied to a form", function() {
        beforeEach(function() {
            document.body.innerHTML =
              __html__["spec_support/fixtures/simple-form.html"] +
              __html__["spec_support/fixtures/ajax-target.html"];

            submitter = Ninja.tools.ajaxSubmitter($('#simple-form')[0])

            sandbox = sinon.sandbox.create()
            sandbox.useFakeServer()
          })

        afterEach(function() {
            sandbox.restore()
          })

        it("should send an ajax request on .submit()", function() {
            expect(sandbox.server.requests.length).toEqual(0)
            submitter.submit()
            expect(sandbox.server.requests.length).toEqual(1)
          })

        it("should apply the resulting javascript", function() {
            expect($("#ajax-target > *").length).toEqual(0)
            submitter.submit()
            sandbox.server.requests[0].respond(
                  200,
                  {"Content-Type": "text/javascript"},
                  __html__["spec_support/fixtures/script-response.js"]
                )
            expect($("#ajax-target > *").length).toEqual(3)
          })
      })
  })
