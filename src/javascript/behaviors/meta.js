goog.provide('ninjascript.behaviors.Meta');

goog.require('ninjascript.behaviors.Abstract');
goog.require('ninjascript.exceptions');

ninjascript.behaviors.Meta = function(setup, callback) {
  setup(this)
  this.chooser = callback
};

ninjascript.behaviors.Meta.prototype = new ninjascript.behaviors.Abstract;

(function() {
    var prototype = ninjascript.behaviors.Meta.prototype

    prototype.choose = function(element) {
      var chosen = this.chooser(element)
      if(chosen !== undefined) {
        return chosen.choose(element)
      }
      else {
        throw new ninjascript.exceptions.CouldntChooseException("Couldn't choose behavior for " . element.toString())
      }
    }
  })()
