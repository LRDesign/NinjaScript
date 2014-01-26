goog.provide("ninjascript.Logger")

goog.require('ninjascript.configuration');

ninjascript.Logger = function(name, config, parent){
  this.name = name;
  this.config = config;

  this.parentLogger = parent;
};

ninjascript.LoggerConfig = function(logger){
  this.logger = logger;
};

(function(){
    var prototype = ninjascript.Logger.prototype;

    prototype.logWithLevel = function(level, handlers, message) {
      handlers.unshift([this.name, this.getLevel()]);

      if(level <= this.getLevel()){
        this.actuallyLog(level, handlers, message);
      } else if(this.parentLogger) {
        this.parentLogger.logWithLevel(level, handlers, message);
      }
    };

    prototype.actuallyLog = function(level, handlers, messages) {
      var i, label = level + ":", args = [];

      for(i = 0; i < handlers.length; i++){
        label = label + "[" + handlers[i][0] + ":" + handlers[i][1] + "]"
      }

      args.push(label);

      for(i = 0; i < messages.length; i++){
        args.push(messages[i]);
      }

      try {
        console.log.apply(console, args);
      }
      catch(e) {} //we're in IE or FF w/o Firebug or something
    };

    prototype.getLevel = function(){
      return this.config.level;
    };

    prototype.childLogger = function(name, defaultLevel){
      defaultLevel = defaultLevel || 0;
      var childConfig = {level: defaultLevel}
      this.config[name] = childConfig;
      return new ninjascript.Logger(name, childConfig, this);
    };

    prototype.fatal = function() { this.logWithLevel(0, [], arguments); };
    prototype.error = function() { this.logWithLevel(1, [], arguments); };
    prototype.warn = function() { this.logWithLevel(2, [], arguments); };
    prototype.info = function() { this.logWithLevel(3, [], arguments); };
    prototype.debug = function() { this.logWithLevel(4, [], arguments); };

    prototype.log = prototype.error;
  })();

;(function(){
  ninjascript.Logger.rootConfig = { level: 0 }
  ninjascript.Logger.rootLogger = new ninjascript.Logger("root", ninjascript.Logger.rootConfig);

  ninjascript.Logger.forComponent = function(name, defaultLevel){
    return ninjascript.Logger.rootLogger.childLogger(name, defaultLevel);
  };
})();
