var realXhr
beforeEach(function() {
  if (typeof jQuery != 'undefined') {
    realXhr = jQuery.ajaxSettings.xhr

    spyOn(jQuery.ajaxSettings, 'xhr').andCallFake(function() {
      var newXhr = new FakeXMLHttpRequest();
      ajaxRequests.push(newXhr);
      return newXhr;
    });
  }

  if (typeof Prototype != 'undefined') {
    realXhr = Ajax.getTransport
    spyOn(Ajax, "getTransport").andCallFake(function() {
      return new FakeXMLHttpRequest();
    });
  }

  clearAjaxRequests();

});
