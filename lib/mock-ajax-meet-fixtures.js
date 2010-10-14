jasmine.Fixtures.prototype.realAjax = function(settings_object) {
  var spy = jQuery.ajaxSettings.xhr
  var result
  settings_object.beforeSend = function(xhr) {
    return xhr
  }
  if(typeof spy.originalValue != "undefined") {
    jQuery.ajaxSettings.xhr = spy.originalValue
    result = jQuery.ajax(settings_object)
    jQuery.ajaxSettings.xhr = spy
  }
  else {
    result = jQuery.ajax(settings_object)
  }
  return result
}
