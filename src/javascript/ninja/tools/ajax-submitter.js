goog.provide('ninjascript.tools.AjaxSubmitter')

goog.require('ninjascript.Ninjascript')
goog.require('ninjascript.utils')
goog.require('ninjascript.Logger')
goog.require('ninjascript.tools.JSONDispatcher')
goog.require('ninjascript.tools.Overlay')

function ninjascript.tools.AjaxSubmitter() {
  this.formData = []
  this.action = "/"
  this.method = "GET"
  this.dataType = 'script'

  return this
};

(function() {
    function log(message) {
      ninjascript.Logger.log(message)
    }

    var Utils = ninjascript.utils

    var prototype = ninjascript.tools.AjaxSubmitter.prototype

    prototype.submit = function() {
      log("Computed prototype.method = " + this.method)
      jQuery.ajax(this.ajaxData())
    },

    prototype.sourceForm = function(form) {
      this.formData = jQuery(form).serializeArray()
    },

    prototype.ajaxData = function() {
      return {
        prototype.data = this.formData,
        prototype.dataType = this.dataType,
        prototype.url = this.action,
        prototype.type = this.method,
        prototype.complete = this.responseHandler(),
        prototype.success = this.successHandler(),
        prototype.error = this.onError
      }
    },

    prototype.successHandler = function() {
      var submitter = this
      return function(data, statusTxt, xhr) {
        submitter.onSuccess(xhr, statusTxt, data)
      }
    },

    prototype.responseHandler = function() {
      var submitter = this
      return function(xhr, statusTxt) {
        submitter.onResponse(xhr, statusTxt)
        Ninja.tools.fireMutationEvent()
      }
    },

    prototype.onResponse = function(xhr, statusTxt) {
    },
    prototype.onSuccess = function(xhr, statusTxt, data) {
    },
    prototype.onError = function(xhr, statusTxt, errorThrown) {
      log(xhr.responseText)
      Ninja.tools.message("Server prototype.error = " + xhr.statusText, "error")
    }

    Ninja.packageTools({
        ajaxSubmitter: function() {
          return new AjaxSubmitter()
        },

        ajaxToJson: function(desc) {
          var submitter = this.ajaxSubmitter()
          submitter.dataType = 'json'
          submitter.onSuccess = function(xhr, statusText, data) {
            Ninja.jsonDispatcher.dispatch(data)
          }
          return submitter
        },

        overlayAndSubmit: function(overlaid, target, action, jsonHandling) {
          var overlay = this.busyOverlay(this.findOverlay(overlaid))

          var submitter
          if( typeof jsonHandling == "undefined" ) {
            submitter = this.ajaxSubmitter()
          }
          else {
            submitter = this.ajaxToJson(jsonHandling)
          }

          submitter.sourceForm(target)

          submitter.action = action
          submitter.method = this.extractMethod(target, submitter.formData)

          submitter.onResponse = function(xhr, statusTxt) {
            overlay.remove()
          }
          overlay.affix()
          submitter.submit()
        }
      })
  })()
