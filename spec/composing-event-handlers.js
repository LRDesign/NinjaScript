describe("Composed Event Handlers", function() {
    var triggeredEvidence = []
    var Ninja
    beforeEach(function() {
        triggeredEvidence = []

        Ninja = ninjascript.build()

        Ninja.behavior({
            "#ajax-target": {
              "tested": function(event, behavior ) {
                triggeredEvidence.push("And so was I")
              }
            }
          })
        Ninja.behavior({
            "#ajax-target": {
              "tested": function(event, behavior ) {
                triggeredEvidence.push("I was here")
              }
            }
          })
        Ninja.go()
        document.body.innerHTML = __html__["spec_support/fixtures/ajax-target.html"];

        Ninja.tools.fireMutationEvent()
      })

    afterEach(function(){
        Ninja.stop()
      })

    it("should be able to trigger all event handlers", function() {
        expect(triggeredEvidence.length).toEqual(0)
        $("#ajax-target").trigger("tested")
        expect(triggeredEvidence.length).toEqual(2)
        expect(triggeredEvidence[0]).toEqual("I was here")
        expect(triggeredEvidence[1]).toEqual("And so was I")
      })


  })
