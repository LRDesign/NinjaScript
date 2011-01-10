// vim: set sw=2 ft=javascript.jasmine-javascript:
//

describe("AjaxSubmitter", function() {
  var submitter

  describe("applied to a link", function() {
    beforeEach(function() {

      setFixtures(fixtures.simple_link + fixtures.ajax_target)
      submitter = Ninja.tools.ajax_submitter($('#simple-link')[0])

      mockAjax()

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
      setFixtures( '<form id="simple-form" action="/testing-ajax-link-submitter" method="post">\
  <input type="hidden" name="_method" value="put"></input>\
  <input type="hidden" name="thing" value="16"></input>\
  <input type="submit" name="Submit!" value="To the Zod">\
</form>'+ fixtures.ajax_target)
      submitter = Ninja.tools.ajax_submitter($('#simple-form')[0])
      mockAjax()
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
