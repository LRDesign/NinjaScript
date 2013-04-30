goog.require('ninjascript.loaded')

var fixtures = {
  ajaxTarget: '<div id="ajax-target"></div>',
  simpleLink: '<a href="#" id="simple-link">Click on me!</a>',
  simpleForm: function(from) {
    return '<form id="simple-form" action="/test-ajax-link-' + from +'" method="post" data-testing="yes">\
  <input type="hidden" name="Method" value="put"></input>\
  <input type="hidden" name="thing" value="16"></input>\
  <input type="submit" name="Submit!" value="To the Zod">\
</form>'},
  scriptResponse: '$("#ajax-target").append("<p>One</p>").append("<p>Two</p>").append("<p>Threeeeee!</p>")',
  confirmingCheckbox: '<form><input id="confirmable-checkbox" type="checkbox" name="checkmeout" /><label for="checkmeout">Check it!</label></form>'
}

/*
#jQuery.ajaxSettings.xhr = function() {
  #  return new XMLHttpRequest();
  #}
  */


// vim: set sw=2:
