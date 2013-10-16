goog.require('ninjascript.loaded');

describe("Priorities:", function() {
    var Ninja

    beforeEach(function(){
        Ninja = ninjascript.build()
      })

    afterEach(function(){
        Ninja.stop()
      })

    describe("becomesAjaxLink()", function() {
        function appendData(string, prio) {
          return {
              transform: function(element) {
                $(element).attr("data-list", $(element).attr("data-list") + string)
                //TODO removing this tests the default transform value
              },
              priority: prio
            }
        }
        beforeEach(function() {
            document.body.innerHTML = __html__["spec_support/fixtures/ajax-target.html"];
          })

        it("1 before 10", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2", 10),
                  appendData("1", 1)
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=12")
          })
        it("-1 before 1", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2", 1),
                  appendData("1", -1)
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=12")
          })
        it("-10 before -1", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2", -1),
                  appendData("1", -10)
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=12")
          })

        it("undefined before 1", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2", 1),
                  appendData("1")
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=12")

          })
        it("-1 before undefined", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2"),
                  appendData("1", -1)
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=12")
          })
        it("same prio: lexical order", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2", 17),
                  appendData("1", 17)
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=21")
          })
        it("both undefined: lexical order", function() {
            Ninja.behavior({
                "#ajax-target": [
                  appendData("2"),
                  appendData("1")
                  ]
              })
            Ninja.go()
            expect($("#ajax-target").attr("data-list")).toEqual("x=21")
          })
      })
  })

// vim: set sw=2 ft=javascript.jasmine-javascript:
