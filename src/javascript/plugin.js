goog.provide('ninjascript.plugin')

goog.require('ninjascript.Extensible')
goog.require('ninjascript.NinjaScript')
goog.require('ninjascript.Tools')

ninjascript.plugin = function(callback){
  var targets = {
    Ninja: ninjascript.NinjaScript.prototype,
    tools: ninjascript.Tools.prototype
  }
  ninjascript.Extensible.addPackage(targets, callback)
}
