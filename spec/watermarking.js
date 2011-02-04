describe("Watermarking", function() {
  describe("on inputs", function() {
    beforeEach(function() {
        Ninja.tools.clearRootCollection()
        var formWatermarker = Ninja.isWatermarked()
        setupFixtures( "<form id='form_a' action='#' method='POST'>" +
            "<label for='input_a'>INPUT!</label>" +
            "<input id='input_a' type='text' />" +
            "</form>" 
        )
        var form = $('#form_a')[0]
        formWatermarker.applyWatermarkToInput($('#input_a')[0], form)
      })

    it("input should have default value set", function() {

      })

    it("input should have .ninja_watermarked class", function() {
      
      })

    describe("when focused", function() {
        it("should not have default text", function() {

          })

        it("should not have .ninja_watermarked class", function() {

          })

        describe("when loses focus with input", function() {
            it("should not have the input text", function() {

              })

            it("should not have .ninja_watermarked class", function() {

              })
          })

        describe("and loses focus without input", function() {
            it("should have default text", function() {

              })

            it("should have .ninja_watermarked class", function() {

              })
          })
      })
  })

})

