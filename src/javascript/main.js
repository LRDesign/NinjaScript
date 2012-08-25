goog.require('ninjascript.NinjaScript')

Ninja = new ninjascript.NinjaScript()

//Covers for deprecated API requirement
Ninja.orders = function(funk) {
  funk(window.Ninja)
}

goog.exportSymbol('Ninja', Ninja)
