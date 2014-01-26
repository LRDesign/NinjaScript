goog.provide('ninjascript.tools.AjaxSubmitter')

goog.require('ninjascript.utils')
goog.require('ninjascript.Logger')
goog.require('ninjascript.tools.JSONDispatcher')
goog.require('ninjascript.tools.Overlay')

goog.require('ninjascript.plugin')

ninjascript.tools.AjaxSubmitter = function() {
  this.formData = []
  this.action = "/"
  this.method = "GET"
  this.dataType = 'script'

  return this
};

(function() {
    var logger =  ninjascript.Logger.forComponent("ajax")

    var Utils = ninjascript.utils

    var prototype = ninjascript.tools.AjaxSubmitter.prototype

    prototype.submit = function() {
      logger.info("Computed prototype.method = " + this.method)
      jQuery.ajax(this.ajaxData())
    },

    prototype.sourceForm = function(form) {
      this.formData = jQuery(form).serializeArray()
    },

    prototype.ajaxData = function() {
      return {
        data: this.formData,
        dataType: this.dataType,
        url: this.action,
        type: this.method,
        complete: this.responseHandler(),
        success: this.successHandler(),
        error: this.onError
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
      logger.error(xhr.responseText)
      Ninja.tools.message("Server prototype.error = " + xhr.statusText, "error")
    }

    ninjascript.plugin(function(hooks){
        hooks.tools({
            ajaxSubmitter: function() {
              return new ninjascript.tools.AjaxSubmitter()
            },

            ajaxToJson: function(desc) {
              var submitter = this.ajaxSubmitter()
              var dispatcher = this.jsonDispatcher
              submitter.dataType = 'json'
              submitter.onSuccess = function(xhr, statusText, data) {
                dispatcher.dispatch(data)
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
          })})
  })()
