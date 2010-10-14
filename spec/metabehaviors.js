describe("Metabehaviors", function() {
  var response
  beforeEach(function() {
    $.ninja.tools.clear_root_collection()
    $.behavior({
      "#simple-form": $.ninja.submits_as_ajax(),
      "#simple-link": $.ninja.submits_as_ajax()
    })
    setFixtures(fixtures.simple_form + fixtures.simple_link + fixtures.ajax_target)
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
  
  it("should handle click", function() {
    expect(ajaxRequests.length).toEqual(0)
    $("a#simple-link").trigger("click")
    expect(ajaxRequests.length).toEqual(1)
  })

  it("should handle submit", function() {
    expect(ajaxRequests.length).toEqual(0)
    $("form#simple-form").trigger("submit")
    expect(ajaxRequests.length).toEqual(1)
  })
})

