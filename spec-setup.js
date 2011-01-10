var fixtures = {
  ajax_target: '<div id="ajax-target"></div>',
  simple_link: '<a href="#" id="simple-link">Click on me!</a>',
  simple_form: function(from) {
    return '<form id="simple-form" action="/test-ajax-link-' + from +'" method="post">\
  <input type="hidden" name="_method" value="put"></input>\
  <input type="hidden" name="thing" value="16"></input>\
  <input type="submit" name="Submit!" value="To the Zod">\
</form>'},
  script_response: '$("#ajax-target").append("<p>One</p>").append("<p>Two</p>").append("<p>Threeeeee!</p>")'
}

jQuery.ajaxSettings.xhr = function() {
  return new XMLHttpRequest();
}


// vim: set sw=2:

