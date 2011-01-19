describe("Packaged Behaviors:", function() {
  describe("becomes_ajax_link()", function() {
    beforeEach(function() {
      Ninja.tools.clear_root_collection()
      Ninja.behavior({
        "#simple-form": Ninja.becomes_ajax_link()
      })
      setFixtures( fixtures.simple_form('packaged') + fixtures.ajax_target)
      mockAjax()
    })

    it("should transform the form into a link", function() {
      expect($("form#simple-form")).not.toExist()
      expect($("a#simple-form")).toExist()
    })

    describe("handling clicking the link", function() {
      var response
      beforeEach(function() {
        response = {
          status: 200,
          contentType: "text/javascript",
          responseText: fixtures.script_response
        }
      })

      afterEach(function() { 
        for(var i in ajaxRequests) {
            ajaxRequests[i].response(response) 
          }
      })
      

      it("should handle clicking the link to send a post", function() {
        expect(ajaxRequests.length).toEqual(0)
        $("a#simple-form").trigger("click")
        expect(ajaxRequests.length).toEqual(1)
        expect(ajaxRequests[0].method).toEqual("PUT")
      })

      it("should put up an overlay", function() {
        expect($("div.ninja.busy")).not.toExist()
        $("a#simple-form").trigger("click")
        expect($("div.ninja.busy")).toExist()
        ajaxRequests[0].response(response)
        expect($("div.ninja.busy")).not.toExist()
      })

      it("should apply the reply javascript", function() {
        $("a#simple-form").trigger("click")
        expect($("#ajax-target > *").length).toEqual(0)
        ajaxRequests[0].response(response)
        expect($("#ajax-target > *").length).toEqual(3)
      })
    })
  })
})




// vim: set sw=2 ft=javascript.jasmine-javascript:

