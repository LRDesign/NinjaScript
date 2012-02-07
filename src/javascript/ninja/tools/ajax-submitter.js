define(["ninja", "utils", "./json-dispatcher", "./overlay"], function(Ninja, Utils, jH, O) {
    function log(message) {
      Utils.log(message)
    }

    function AjaxSubmitter() {
      this.formData = []
      this.action = "/"
      this.method = "GET"
      this.dataType = 'script'

      return this
    }

    AjaxSubmitter.prototype = {
      submit: function() {
        log("Computed method: " + this.method)
        jQuery.ajax(this.ajaxData())
      },

      sourceForm: function(form) {
        this.formData = jQuery(form).serializeArray()
      },

      ajaxData: function() {
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

      successHandler: function() {
        var submitter = this
        return function(data, statusTxt, xhr) {
          submitter.onSuccess(xhr, statusTxt, data)
        }
      },

      responseHandler: function() {
        var submitter = this
        return function(xhr, statusTxt) {
          submitter.onResponse(xhr, statusTxt)
          Ninja.tools.fireMutationEvent()
        }
      },

      onResponse: function(xhr, statusTxt) {
      },
      onSuccess: function(xhr, statusTxt, data) {
      },
      onError: function(xhr, statusTxt, errorThrown) {
        log(xhr.responseText)
        Ninja.tools.message("Server error: " + xhr.statusText, "error")
      }
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

        overlayAndSubmit: function(target, action, jsonHandling) {
          var overlay = this.busyOverlay(this.findOverlay(target))

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


    return AjaxSubmitter
  })
