describe("Metabehaviors", function() {
  var response
  beforeEach(function() {
    Ninja.tools.clear_root_collection()
    Ninja.behavior({
      "#simple-form": Ninja.submits_as_ajax(),
      "#simple-link": Ninja.submits_as_ajax()
    })
    setFixtures(fixtures.simple_form('metabehaviors') + fixtures.simple_link + fixtures.ajax_target)
    response = {
      status: 200,
      contentType: "text/javascript",
      responseText: fixtures.script_response
    }
    mockAjax()
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
    //$("form#simple-form").trigger("submit")
    expect(ajaxRequests.length).toEqual(1)
  })
})

