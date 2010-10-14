// vim: set sw=2 ft=javascript.jasmine-javascript:

describe("AjaxSubmitter", function() {
  var submitter

  describe("applied to a link", function() {
    beforeEach(function() {
      setFixtures(fixtures.simple_link + fixtures.ajax_target)
      submitter = $.ninja.tools.ajax_submitter($('#simple-link')[0])
    })

    it("should send an ajax request on .submit()", function() {
      expect(ajaxRequests.length).toEqual(0)
      submitter.submit()
      expect(ajaxRequests.length).toEqual(1)
    })

    it("should apply the resulting javascript", function() {
      expect($("#ajax-target > *").length).toEqual(0)
      submitter.submit()
      ajaxRequests[0].response({
        status: 200, 
        contentType: "text/javascript", 
        responseText: fixtures.script_response
      })
      expect($("#ajax-target > *").length).toEqual(3)
    })
  })
  
  describe("applied to a form", function() {
    beforeEach(function() {
      setFixtures(fixtures.simple_form + fixtures.ajax_target)
      submitter = $.ninja.tools.ajax_submitter($('#simple-form')[0])
    })

    it("should send an ajax request on .submit()", function() {
      expect(ajaxRequests.length).toEqual(0)
      submitter.submit()
      expect(ajaxRequests.length).toEqual(1)
    })

    it("should apply the resulting javascript", function() {
      expect($("#ajax-target > *").length).toEqual(0)
      submitter.submit()
      ajaxRequests[0].response({
        status: 200, 
        contentType: "text/javascript", 
        responseText: fixtures.script_response
      })
      expect($("#ajax-target > *").length).toEqual(3)
    })
  })
})
