
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

//= require "tools"

Tools.prototype.ajaxSubmitter = function(form) {
  return new AjaxSubmitter(form)
}

