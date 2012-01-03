define(function () {
    function buildException(named) {
      var exceptionConstructor = function (message) {
        Error.call(this, message)
        if(Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor)
        }
        this.name = named; // Used to cause messages like "UserError: message" instead of the default "Error: message"
        this.message = message; // Used to set the message
      }
      exceptionConstructor.prototype = Error.prototype
      return exceptionConstructor
    }

    return {
      CouldntChoose: buildException("CouldntChoose"),
      TransformFailed: buildException("TransformFailed")
    }
  })
