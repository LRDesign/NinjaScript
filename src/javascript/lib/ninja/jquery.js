

//This exists to carry over interfaces from earlier versions of Ninjascript.  Likely, it will be removed from future versions of NinjaScript
( function($) {
    $.extend(
      {
        ninja: Ninja,
        behavior: Ninja.behavior
      }
    );
  }
)(jQuery);
