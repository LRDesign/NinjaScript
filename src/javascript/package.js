goog.provide('ninjascript.package')

goog.require('ninjascript.Extensible')
goog.require('ninjascript.NinjaScript')
goog.require('ninjascript.Tools')

ninjascript.package = function(callback){
  var targets = {
    Ninja: ninjascript.NinjaScript.prototype,
    tools: ninjascript.Tools.prototype
  }
  ninjascript.Extensible.package(targets, callback)
}
