goog.provide('ninjascript.behaviors.Select');

goog.require('ninjascript.behaviors.Abstract');

ninjascript.behaviors.Select = function(menu) {
  this.menu = menu
};

ninjascript.behaviors.Select.prototype = new ninjascript.behaviors.Abstract;

(function(){
    var prototype = ninjascript.behaviors.Select.prototype

    prototype.choose = function(element) {
      for(var selector in this.menu) {
        if(jQuery(element).is(selector)) {
          return this.menu[selector].choose(element)
        }
      }
      return null //XXX Should raise exception
    }

  })()
