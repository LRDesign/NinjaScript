// vim: set sw=2 ft=javascript.jasmine-javascript:
//

describe("AjaxToJson", function() {
    var submitter
    var target

    beforeEach(function() {
        setFixtures(fixtures.simpleLink + fixtures.ajaxTarget)
        target = {}
        submitter = Ninja.tools.ajaxToJson($('#simple-link')[0], 
          {
            shallow: function(html) {
              target.shallow = html
            },
            three: {
              levels: {
                deep: function(number) {
                  target.deep = number
                }
              }
            }
          }
        )

        mockAjax()
      })
    
    it("shouldn't fire until ajax request", function() {
        expect(target.shallow).toBeUndefined()
        expect(target.deep).toBeUndefined()
      })

    it("should send an ajax request on .submit()", function() {
        expect(ajaxRequests.length).toEqual(0)
        submitter.submit()
        expect(ajaxRequests.length).toEqual(1)
      })

    it("should act on the resulting JSON", function() {
        submitter.submit()
        ajaxRequests[0].response({
            status: 200, 
            contentType: "application/json", 
            responseText: '{ "shallow": "testing", "three": { "levels": { "deep": 17 } } }'

          })
        expect(target.shallow).toEqual("testing")
        expect(target.deep).toEqual(17)
      })
  })
