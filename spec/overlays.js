describe("Overlays", function() {
  beforeEach(function() {
      setFixtures(fixtures.simple_form('overlays') + fixtures.simple_form('overlays') + fixtures.simple_link)
  })

  it("should target undefined", function() {
    var overlay = Ninja.tools.overlay(undefined)
    overlay.set.each(function(idx, elem){elem.addClass("testing")})
    overlay.affix()
    expect($("div.testing")).not.toExist()
    overlay.remove()
  })
  
  it("should target an empty list", function() {
    var overlay = Ninja.tools.overlay()
    overlay.set.each(function(idx, elem){elem.addClass("testing")})
    overlay.affix()
    expect($("div.testing")).not.toExist()
    overlay.remove()
  })

  it("should target a single element", function() {
    expect($("#simple-link").length).toEqual(1)
    var overlay = Ninja.tools.overlay($("#simple-link"))
    overlay.set.addClass("testing")
    overlay.affix()
    expect($("div.testing")).toExist()
    expect($(".testing").length).toEqual(1)
    overlay.remove()
    expect($("div.testing")).not.toExist()
  })

  it("should target multiple elements", function() {
    expect($("form").length).toEqual(2)
    var overlay = Ninja.tools.overlay($("form"))
    overlay.set.addClass("testing")
    overlay.affix()
    expect($("div.testing")).toExist()
    expect($(".testing").length).toEqual(2)
    overlay.remove()
    expect($("div.testing")).not.toExist()
  })
  
})

// vim: sw=2
