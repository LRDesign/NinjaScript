define( function() {
    return {
      //This is the half-assed: it should be template of some sort
      messageWrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      messageList: "#messages",
      busyLaziness: 200
    }
  })
