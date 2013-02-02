goog.provide('ninjascript.build');

goog.require('ninjascript.NinjaScript');
goog.require('ninjascript.Tools');
goog.require('ninjascript.configuration');
goog.require('ninjascript.tools.JSONDispatcher');
goog.require('ninjascript.mutation.EventHandler');

goog.require('ninjascript.behaviors.Basic');
goog.require('ninjascript.behaviors.Meta');
goog.require('ninjascript.behaviors.Select');

ninjascript.build = function(){
  var components = {}
  components["tools"] = new ninjascript.Tools(components)
  components["config"] = ninjascript.configuration
  components["collection"] = new ninjascript.BehaviorCollection(components)
  components["jsonDispatcher"] = new ninjascript.tools.JSONDispatcher()
  components["mutationHandler"] = new ninjascript.mutation.EventHandler(components.tools.getRootOfDocument(), components.collection)

  components["types"] = {
    "does": ninjascript.behaviors.Basic,
    "chooses": ninjascript.behaviors.Meta,
    "selects": ninjascript.behaviors.Select
  }

  components["ninja"] = new ninjascript.NinjaScript(components)

  components["tools"].inject(components)
  components["ninja"].inject(components)

  return components.ninja
}

Ninja = ninjascript.build()

//Covers for deprecated API requirement
Ninja.orders = function(funk) {
  funk(window.Ninja)
}

goog.exportSymbol('Ninja', Ninja)
goog.exportSymbol('ninjascript.build', ninjascript.build)
