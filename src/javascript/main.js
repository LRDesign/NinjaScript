window["Ninja"] = {
  orderList: [],
  orders: function(order_func){
    this.orderList.push(order_func)
  }
}
require([
    "ninja",
    "ninja/behaviors/all",
    "ninja/tools/all",
    "ninja/jquery"
  ], function(Ninja, stdBehaviors, placeholder, triggerOn, allTools, jquery) {
    var ninjaOrders = window["Ninja"].orderList
    var ordersLength = ninjaOrders.length

    window["Ninja"] = Ninja
    Ninja['behavior'] = Ninja.behavior
    for(var i = 0; i < ordersLength; i++) {
      ninjaOrders[i](Ninja)
    }
    Ninja.orders = function(funk) {
      funk(this) //because it amuses JDL, that's why.
    }
  })
