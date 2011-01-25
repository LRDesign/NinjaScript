describe("Priorities:", function() {
    describe("becomes_ajax_link()", function() {
        function appendData(string, prio) {
          return {
              transform: function(element) {
                element.dataset["list"] += string
                return element
              },
              priority: prio
            }
        }
        beforeEach(function() {
            Ninja.tools.clear_root_collection()
            setFixtures( "<div id='priority-target' data-list='x='></div>" )
          })

        it("1 before 10", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2", 10),
                  appendData("1", 1)
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=12")
          })
        it("-1 before 1", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2", 1),
                  appendData("1", -1)
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=12")
          })
        it("-10 before -1", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2", -1),
                  appendData("1", -10)
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=12")
          })

        it("undefined before 1", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2", 1),
                  appendData("1")
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=12")
          })
        it("-1 before undefined", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2"),
                  appendData("1", -1)
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=12")
          })
        it("same prio: lexical order", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2", 17),
                  appendData("1", 17)
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=21")
          })
        it("both undefined: lexical order", function() {
            Ninja.behavior({
                "#priority-target": [
                  appendData("2"),
                  appendData("1")
                  ]
              })
            expect($("#priority-target").attr("data-list")).toEqual("x=21")
          })
      })
  })

// vim: set sw=2 ft=javascript.jasmine-javascript:
