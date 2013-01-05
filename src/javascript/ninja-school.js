goog.provide('ninjascript.build');

goog.require('ninjascript.NinjaScript');
goog.require('ninjascript.Tools');
goog.require('ninjascript.configuration');
goog.require('ninjascript.tools.JSONDispatcher');
goog.require('ninjascript.Extensions');
goog.require('ninjascript.mutation.EventHandler');

goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.behaviors.Meta');
goog.require('ninjascript.behaviors.Select');

ninjascript.build = function(){
  var components = new ninjascript.Extensions
  components.tools = new ninjascript.Tools(componenets)
  components.config = ninjascript.configuration
  components.collection = new ninjascript.BehaviorCollection(tools)
  components.jsonDispatcher = new ninjascript.tools.JSONDispatcher()
  components.mutationHandler = new ninjascript.mutation.EventHandler(tools.getRootOfDocument(), collection)
  components.ninja = new ninjascript.NinjaScript(components)

  components.types = {
    "does": ninjascript.behaviors.Basic,
    "chooses": ninjascript.behaviors.Meta,
    "selects": ninjascript.behaviors.Select
  }

  tools.behaviorCollection = collection
  tools.ninja = ninja

  components.expose()

  return ninja
}

Ninja = ninjascript.build()

//Covers for deprecated API requirement
Ninja.orders = function(funk) {
  funk(window.Ninja)
}

goog.exportSymbol('Ninja', Ninja)
goog.exportSymbol('ninjascript.build', ninjascript.build)
