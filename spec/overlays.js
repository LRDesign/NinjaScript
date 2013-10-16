describe("Overlays", function() {
    var Ninja

    beforeEach(function() {
        Ninja = ninjascript.build()

        document.body.innerHTML =
          __html__["spec_support/fixtures/simple-form.html"] +
          __html__["spec_support/fixtures/simple-form.html"] +
          __html__["spec_support/fixtures/simple-link.html"];
      })

    afterEach(function() {
        Ninja.stop()
      })

    it("should target undefined", function() {
        var overlay = Ninja.tools.overlay(undefined)
        overlay.set.each(function(idx, elem){elem.addClass("testing")})
        overlay.affix()
        expect($("div.testing").length).toBe(0);
        overlay.remove()
      })

    it("should target an empty list", function() {
        var overlay = Ninja.tools.overlay()
        overlay.set.each(function(idx, elem){elem.addClass("testing")})
        overlay.affix()
        expect($("div.testing").length).toBe(0);
        overlay.remove()
      })

    it("should target a single element", function() {
        expect($("#simple-link").length).toEqual(1)
        var overlay = Ninja.tools.overlay($("#simple-link"))
        overlay.set.addClass("testing")
        overlay.affix()
        expect($("div.testing").length).toBeGreaterThan(0);
        expect($(".testing").length).toEqual(1)
        overlay.remove()
        expect($("div.testing").length).toBe(0);
      })
    ;
    it("should target multiple elements", function() {
        expect($("form").length).toEqual(2)
        var overlay = Ninja.tools.overlay($("form"))
        overlay.set.addClass("testing")
        overlay.affix()
        expect($("div.testing").length).toBeGreaterThan(0);
        expect($(".testing").length).toEqual(2)
        overlay.remove()
        expect($("div.testing").length).toBe(0);
      })

  })

// vim: sw=2
