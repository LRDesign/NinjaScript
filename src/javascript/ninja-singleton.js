goog.provide('ninjascript.singleton');

goog.require('ninjascript.NinjaScript')
goog.require('ninjascript.Tools');
goog.require('ninjascript.configuration');
goog.require('ninjascript.tools.JSONDispatcher');

(function(){
    var tools = new ninjascript.Tools()
    var config = ninjascript.configuration
    var jsonDispatcher = new ninjascript.tools.JSONDispatcher()

    ninjascript.singleton = new ninjascript.NinjaScript(tools, config, jsonDispatcher)
  })()
Ninja = ninjascript.singleton

console.log("Ninja: " + Ninja)

//Covers for deprecated API requirement
Ninja.orders = function(funk) {
  funk(window.Ninja)
}

goog.exportSymbol('Ninja', Ninja)
