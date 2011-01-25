describe("Composed Event Handlers", function() {
    var triggeredEvidence = []
    beforeEach(function() {
        triggeredEvidence = []
        Ninja.tools.clearRootCollection()


        Ninja.behavior({
            "#test-target": {
              "tested": function(event, behavior, oldHandler) {
                triggeredEvidence.push("I was here")
              }
            }
          })
        Ninja.behavior({
            "#test-target": {
              "tested" :function(event, behavior, oldHandler) {
                oldHandler(event)
                triggeredEvidence.push("And so was I")
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
