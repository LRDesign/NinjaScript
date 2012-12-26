// vim: set sw=2 ft=javascript.jasmine-javascript:
//

describe("AjaxSubmitter", function() {
    var submitter
    var sandbox

    describe("applied to a link", function() {
        beforeEach(function() {

            setFixtures(fixtures.simpleLink + fixtures.ajaxTarget)
            submitter = Ninja.tools.ajaxSubmitter($('#simple-link')[0])

            sandbox = sinon.fakeServer.create()
            sandbox.useFakeServer()
          })

        afterEach(function() {
            sandbox.restore()
          })


        it("should send an ajax request on .submit()", function() {
            expect(sandbox.requests.length).toEqual(0)
            submitter.submit()
            expect(sandbox.requests.length).toEqual(1)
          })

        it("should apply the resulting javascript", function() {
            expect($("#ajax-target > *").length).toEqual(0)
            submitter.submit()
            sandbox.requests[0].respond({[
                  200,
                  {"Content-Type": "text/javascript"},
                  fixtures.scriptResponse
                ]})
            expect($("#ajax-target > *").length).toEqual(3)
          })
      })

    describe("applied to a form", function() {
        beforeEach(function() {
            setFixtures( '<form id="simple-form" action="/testing-ajax-link-submitter" method="post">\
              <input type="hidden" name="Method" value="put"></input>\
              <input type="hidden" name="thing" value="16"></input>\
              <input type="submit" name="Submit!" value="To the Zod">\
              </form>'+ fixtures.ajaxTarget)
            submitter = Ninja.tools.ajaxSubmitter($('#simple-form')[0])

            sandbox = sinon.fakeServer.create()
            sandbox.useFakeServer()
          })

        afterEach(function() {
            sandbox.restore()
          })

        it("should send an ajax request on .submit()", function() {
            expect(sandbox.requests.length).toEqual(0)
            submitter.submit()
            expect(sandbox.requests.length).toEqual(1)
          })

        it("should apply the resulting javascript", function() {
            expect($("#ajax-target > *").length).toEqual(0)
            submitter.submit()
            sandbox.requests[0].respond({[
                  200,
                  {"Content-Type": "text/javascript"},
                  fixtures.scriptResponse
                ]})
            expect($("#ajax-target > *").length).toEqual(3)
          })
      })
  })
