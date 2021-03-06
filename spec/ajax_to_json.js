// vim: set sw=2 ft=javascript.jasmine-javascript:
//

describe("AjaxToJson", function() {
    var Ninja

    var submitter
    var target
    var sandbox

    beforeEach(function() {
        Ninja = ninjascript.build()

        document.body.innerHTML =
          __html__["spec_support/fixtures/simple-link.html"] +
          __html__["spec_support/fixtures/ajax-target.html"];

        target = {}
        Ninja.respondToJson({
            shallow: function(html) {
              target.shallow = html
            },
            three: {
              levels: {
                deep: function(number) {
                  target.deep = number
                }
              }
            }
          })
        Ninja.respondToJson(function(json) {
            target.functionDid = json
          })
        Ninja.respondToJson({
            shallow: function(){
              throw "Just an error"
            }
          })
        Ninja.respondToJson({
            shallow: function(html) {
              target.andAlso = html
            }
          })
        submitter = Ninja.tools.ajaxToJson( )

        sandbox = sinon.sandbox.create()
        sandbox.useFakeServer()
      })

    afterEach(function(){
        sandbox.restore()
        Ninja.stop()
      })

    it("shouldn't fire until ajax request", function() {
        expect(target.shallow).toBeUndefined()
        expect(target.deep).toBeUndefined()
      })

    it("should send an ajax request on .submit()", function() {
        expect(sandbox.server.requests.length).toEqual(0)
        submitter.submit()
        expect(sandbox.server.requests.length).toEqual(1)
      })

    describe("acting on JSON result", function() {
        beforeEach(function() {
            submitter.submit()
            sandbox.server.requests[0].respond(
                200,
                {"Content-Type": "application/json"},
                '{ "shallow": "testing", "three": { "levels": { "deep": 17 } } }'
              )
          })

        it("should act on simple keys", function() {
            expect(target.shallow).toEqual("testing")
          })

        it("should do everything for a key", function() {
            expect(target.andAlso).toEqual("testing")
          })

        it("should act on a root handler", function() {
            expect(target.functionDid.shallow).toEqual("testing")
          })

        it("should act on deep keys", function() {
            expect(target.deep).toEqual(17)
          })
      })
  })
