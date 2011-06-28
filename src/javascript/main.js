/* 
 * NinjaScript - <%= VERSION %>
 * written by and copyright 2010-<%= COPYRIGHT_YEAR %> Judson Lester and Logical Reality Design
 * Licensed under the MIT license
 *
 * <%= BUILD_DATE %>
 */

require([
    "ninja",

    "ninja/behaviors/standard",
    "ninja/behaviors/placeholder",
    "ninja/behaviors/trigger-on",

    "ninja/jquery"
  ], function(ninja, stdBehaviors, placeholder, triggerOn, jquery) {
    Ninja = ninja
  })

//= require "lib/ninja"
/**
 * All the behaviors defined by default:
 **/
//= require "lib/ninja/behaviors/standard"
//= require "lib/ninja/behaviors/placeholder"
//= require "lib/ninja/behaviors/trigger-on"
/*
 * End behaviors
 **/
//= require "lib/ninja/jquery"
//= provide "../assets"
