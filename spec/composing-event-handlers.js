describe("Composed Event Handlers", function() {
    var triggeredEvidence = []
    var Ninja
    beforeEach(function() {
        triggeredEvidence = []

        Ninja = ninjscript.build()

        Ninja.behavior({
            "#test-target": {
              "tested" :function(event, behavior ) {
                triggeredEvidence.push("And so was I")
              }
            }
          })
        Ninja.behavior({
            "#test-target": {
              "tested": function(event, behavior ) {
                triggeredEvidence.push("I was here")
              }
            }
          })
        Ninja.go()
        setFixtures("<div id='test-target'></div>")

        Ninja.tools.fireMutationEvent()
      })

    it("should be able to trigger all event handlers", function() {
        expect(triggeredEvidence.length).toEqual(0)
        $("#test-target").trigger("tested")
        expect(triggeredEvidence.length).toEqual(2)
        expect(triggeredEvidence[0]).toEqual("I was here")
        expect(triggeredEvidence[1]).toEqual("And so was I")
      })


  })
