/* 
 * NinjaScript - 0.9.0
 * written by and copyright 2010-2011 Judson Lester and Logical Reality Design
 * Licensed under the MIT license
 * 2011-02-04
 *
 * Those new to this source should skim down to standardBehaviors
 */
Ninja = (function() {
    function log(message) {
      if(false) { //LOGGING TURNED OFF IS 100% faster!
        try {
          console.log(message)
        }
        catch(e) {} //we're in IE or FF w/o Firebug or something
      }
    }

  function isArray(candidate) {
    return (candidate.constructor == Array)
  }

  function forEach(list, callback, thisArg) {
    if(typeof list.forEach == "function") {
      return list.forEach(callback, thisArg)
    }
    else if(typeof Array.prototype.forEach == "function") {
      return Array.prototype.forEach.call(list, callback, thisArg)
    }
    else {
      var len = Number(list.length)
      for(var k = 0; k < len; k+=1) {
        if(typeof list[k] != "undefined") {
          callback.call(thisArg, list[k], k, list)
        }
      }
      return
    }
  }


  /* 
   * Sizzle CSS engine
   * Copyright 2009 The Dojo Foundation
   * Released under the MIT, BSD, and GPL Licenses.
   *
   * This version of the Sizzle engine taken from jQuery 1.4.2
   * Doesn't conflict with Mutation events.
   */

  var Sizzle = (function(){
      var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^[\]]*\]|['"][^'"]*['"]|[^[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
          done = 0,
          toString = Object.prototype.toString,
          hasDuplicate = false,
          baseHasDuplicate = true;

          // Here we check if the JavaScript engine is using some sort of
          // optimization where it does not always call our comparision
          // function. If that is the case, discard the hasDuplicate value.
          //   Thus far that includes Google Chrome.
          [0, 0].sort(function(){
              baseHasDuplicate = false;
              return 0;
            });

          var Sizzle = function(selector, context, results, seed) {
            results = results || [];
            var origContext = context = context || document;

            if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
              return [];
            }

            if ( !selector || typeof selector !== "string" ) {
              return results;
            }

            var parts = [], m, set, checkSet, extra, prune = true, contextXML = isXML(context),
            soFar = selector;

            // Reset the position of the chunker regexp (start from head)
            while ( (chunker.exec(""), m = chunker.exec(soFar)) !== null ) {
              soFar = m[3];

              parts.push( m[1] );

              if ( m[2] ) {
                extra = m[3];
                break;
              }
            }

            if ( parts.length > 1 && origPOS.exec( selector ) ) {
              if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
                set = posProcess( parts[0] + parts[1], context );
              } else {
                set = Expr.relative[ parts[0] ] ?
                [ context ] :
                Sizzle( parts.shift(), context );

                while ( parts.length ) {
                  selector = parts.shift();

                  if ( Expr.relative[ selector ] ) {
                    selector += parts.shift();
                  }

                  set = posProcess( selector, set );
                }
              }
            } else {
              // Take a shortcut and set the context if the root selector is an ID
              // (but not if it'll be faster if the inner selector is an ID)
              if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
                Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
                var ret = Sizzle.find( parts.shift(), context, contextXML );
                context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
              }

              if ( context ) {
                var ret = seed ?
                { expr: parts.pop(), set: makeArray(seed) } :
                Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
                set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

                if ( parts.length > 0 ) {
                  checkSet = makeArray(set);
                } else {
                  prune = false;
                }

                while ( parts.length ) {
                  var cur = parts.pop(), pop = cur;

                  if ( !Expr.relative[ cur ] ) {
                    cur = "";
                  } else {
                    pop = parts.pop();
                  }

                  if ( pop == null ) {
                    pop = context;
                  }

                  Expr.relative[ cur ]( checkSet, pop, contextXML );
                }
              } else {
                checkSet = parts = [];
              }
            }

            if ( !checkSet ) {
              checkSet = set;
            }

            if ( !checkSet ) {
              Sizzle.error( cur || selector );
            }

            if ( toString.call(checkSet) === "[object Array]" ) {
              if ( !prune ) {
                results.push.apply( results, checkSet );
              } else if ( context && context.nodeType === 1 ) {
                for ( var i = 0; checkSet[i] != null; i++ ) {
                  if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && contains(context, checkSet[i])) ) {
                    results.push( set[i] );
                  }
                }
              } else {
                for ( var i = 0; checkSet[i] != null; i++ ) {
                  if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
                    results.push( set[i] );
                  }
                }
              }
            } else {
              makeArray( checkSet, results );
            }

            if ( extra ) {
              Sizzle( extra, origContext, results, seed );
              Sizzle.uniqueSort( results );
            }

            return results;
          };

          Sizzle.uniqueSort = function(results){
            if ( sortOrder ) {
              hasDuplicate = baseHasDuplicate;
              results.sort(sortOrder);

              if ( hasDuplicate ) {
                for ( var i = 1; i < results.length; i++ ) {
                  if ( results[i] === results[i-1] ) {
                    results.splice(i--, 1);
                  }
                }
              }
            }

            return results;
          };

          Sizzle.matches = function(expr, set){
            return Sizzle(expr, null, null, set);
          };

          Sizzle.find = function(expr, context, isXML){
            var set, match;

            if ( !expr ) {
              return [];
            }

            for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
              var type = Expr.order[i], match;

              if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
                var left = match[1];
                match.splice(1,1);

                if ( left.substr( left.length - 1 ) !== "\\" ) {
                  match[1] = (match[1] || "").replace(/\\/g, "");
                  set = Expr.find[ type ]( match, context, isXML );
                  if ( set != null ) {
                    expr = expr.replace( Expr.match[ type ], "" );
                    break;
                  }
                }
              }
            }

            if ( !set ) {
              set = context.getElementsByTagName("*");
            }

            return {set: set, expr: expr};
          };

          Sizzle.filter = function(expr, set, inplace, not){
            var old = expr, result = [], curLoop = set, match, anyFound,
            isXMLFilter = set && set[0] && isXML(set[0]);

            while ( expr && set.length ) {
              for ( var type in Expr.filter ) {
                if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
                  var filter = Expr.filter[ type ], found, item, left = match[1];
                  anyFound = false;

                  match.splice(1,1);

                  if ( left.substr( left.length - 1 ) === "\\" ) {
                    continue;
                  }

                  if ( curLoop === result ) {
                    result = [];
                  }

                  if ( Expr.preFilter[ type ] ) {
                    match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

                    if ( !match ) {
                      anyFound = found = true;
                    } else if ( match === true ) {
                      continue;
                    }
                  }

                  if ( match ) {
                    for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
                      if ( item ) {
                        found = filter( item, match, i, curLoop );
                        var pass = not ^ !!found;

                        if ( inplace && found != null ) {
                          if ( pass ) {
                            anyFound = true;
                          } else {
                            curLoop[i] = false;
                          }
                        } else if ( pass ) {
                          result.push( item );
                          anyFound = true;
                        }
                      }
                    }
                  }

                  if ( found !== undefined ) {
                    if ( !inplace ) {
                      curLoop = result;
                    }

                    expr = expr.replace( Expr.match[ type ], "" );

                    if ( !anyFound ) {
                      return [];
                    }

                    break;
                  }
                }
              }

              // Improper expression
              if ( expr === old ) {
                if ( anyFound == null ) {
                  Sizzle.error( expr );
                } else {
                  break;
                }
              }

              old = expr;
            }

            return curLoop;
          };

          Sizzle.error = function( msg ) {
            throw "Syntax error, unrecognized expression: " + msg;
          };

          var Expr = Sizzle.selectors = {
            order: [ "ID", "NAME", "TAG" ],
            match: {
              ID: /#((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
              CLASS: /\.((?:[\w\u00c0-\uFFFF-]|\\.)+)/,
              NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF-]|\\.)+)['"]*\]/,
              ATTR: /\[\s*((?:[\w\u00c0-\uFFFF-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
              TAG: /^((?:[\w\u00c0-\uFFFF\*-]|\\.)+)/,
              CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+-]*)\))?/,
              POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^-]|$)/,
              PSEUDO: /:((?:[\w\u00c0-\uFFFF-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
          },
          leftMatch: {},
          attrMap: {
            "class": "className",
            "for": "htmlFor"
          },
          attrHandle: {
            href: function(elem){
              return elem.getAttribute("href");
            }
          },
          relative: {
            "+": function(checkSet, part){
              var isPartStr = typeof part === "string",
              isTag = isPartStr && !/\W/.test(part),
              isPartStrNotTag = isPartStr && !isTag;

              if ( isTag ) {
                part = part.toLowerCase();
              }

              for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
                if ( (elem = checkSet[i]) ) {
                  while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

                  checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
                  elem || false :
                  elem === part;
                }
              }

              if ( isPartStrNotTag ) {
                Sizzle.filter( part, checkSet, true );
              }
            },
            ">": function(checkSet, part){
              var isPartStr = typeof part === "string";

              if ( isPartStr && !/\W/.test(part) ) {
                part = part.toLowerCase();

                for ( var i = 0, l = checkSet.length; i < l; i++ ) {
                  var elem = checkSet[i];
                  if ( elem ) {
                    var parent = elem.parentNode;
                    checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
                  }
                }
              } else {
                for ( var i = 0, l = checkSet.length; i < l; i++ ) {
                  var elem = checkSet[i];
                  if ( elem ) {
                    checkSet[i] = isPartStr ?
                    elem.parentNode :
                    elem.parentNode === part;
                  }
                }

                if ( isPartStr ) {
                  Sizzle.filter( part, checkSet, true );
                }
              }
            },
            "": function(checkSet, part, isXML){
              var doneName = done++, checkFn = dirCheck;

              if ( typeof part === "string" && !/\W/.test(part) ) {
                var nodeCheck = part = part.toLowerCase();
                checkFn = dirNodeCheck;
              }

              checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
            },
            "~": function(checkSet, part, isXML){
              var doneName = done++, checkFn = dirCheck;

              if ( typeof part === "string" && !/\W/.test(part) ) {
                var nodeCheck = part = part.toLowerCase();
                checkFn = dirNodeCheck;
              }

              checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
            }
          },
          find: {
            ID: function(match, context, isXML){
              if ( typeof context.getElementById !== "undefined" && !isXML ) {
                var m = context.getElementById(match[1]);
                return m ? [m] : [];
              }
            },
            NAME: function(match, context){
              if ( typeof context.getElementsByName !== "undefined" ) {
                var ret = [], results = context.getElementsByName(match[1]);

                for ( var i = 0, l = results.length; i < l; i++ ) {
                  if ( results[i].getAttribute("name") === match[1] ) {
                    ret.push( results[i] );
                  }
                }

                return ret.length === 0 ? null : ret;
              }
            },
            TAG: function(match, context){
              return context.getElementsByTagName(match[1]);
            }
          },
          preFilter: {
            CLASS: function(match, curLoop, inplace, result, not, isXML){
              match = " " + match[1].replace(/\\/g, "") + " ";

              if ( isXML ) {
                return match;
              }

              for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
                if ( elem ) {
                  if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
                    if ( !inplace ) {
                      result.push( elem );
                    }
                  } else if ( inplace ) {
                    curLoop[i] = false;
                  }
                }
              }

              return false;
            },
            ID: function(match){
              return match[1].replace(/\\/g, "");
            },
            TAG: function(match, curLoop){
              return match[1].toLowerCase();
            },
            CHILD: function(match){
              if ( match[1] === "nth" ) {
                // parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
                var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
                  match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
                  !/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

                // calculate the numbers (first)n+(last) including if they are negative
                match[2] = (test[1] + (test[2] || 1)) - 0;
                match[3] = test[3] - 0;
              }

              // TODO: Move to normal caching system
              match[0] = done++;

              return match;
            },
            ATTR: function(match, curLoop, inplace, result, not, isXML){
              var name = match[1].replace(/\\/g, "");

              if ( !isXML && Expr.attrMap[name] ) {
                match[1] = Expr.attrMap[name];
              }

              if ( match[2] === "~=" ) {
                match[4] = " " + match[4] + " ";
              }

              return match;
            },
            PSEUDO: function(match, curLoop, inplace, result, not){
              if ( match[1] === "not" ) {
                // If we're dealing with a complex expression, or a simple one
                if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
                  match[3] = Sizzle(match[3], null, null, curLoop);
                } else {
                  var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
                  if ( !inplace ) {
                    result.push.apply( result, ret );
                  }
                  return false;
                }
              } else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
                return true;
              }

              return match;
            },
            POS: function(match){
              match.unshift( true );
              return match;
            }
          },
          filters: {
            enabled: function(elem){
              return elem.disabled === false && elem.type !== "hidden";
            },
            disabled: function(elem){
              return elem.disabled === true;
            },
            checked: function(elem){
              return elem.checked === true;
            },
            selected: function(elem){
              // Accessing this property makes selected-by-default
              // options in Safari work properly
              elem.parentNode.selectedIndex;
              return elem.selected === true;
            },
            parent: function(elem){
              return !!elem.firstChild;
            },
            empty: function(elem){
              return !elem.firstChild;
            },
            has: function(elem, i, match){
              return !!Sizzle( match[3], elem ).length;
            },
            header: function(elem){
              return /h\d/i.test( elem.nodeName );
            },
            text: function(elem){
              return "text" === elem.type;
            },
            radio: function(elem){
              return "radio" === elem.type;
            },
            checkbox: function(elem){
              return "checkbox" === elem.type;
            },
            file: function(elem){
              return "file" === elem.type;
            },
            password: function(elem){
              return "password" === elem.type;
            },
            submit: function(elem){
              return "submit" === elem.type;
            },
            image: function(elem){
              return "image" === elem.type;
            },
            reset: function(elem){
              return "reset" === elem.type;
            },
            button: function(elem){
              return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
            },
            input: function(elem){
              return /input|select|textarea|button/i.test(elem.nodeName);
            }
          },
          setFilters: {
            first: function(elem, i){
              return i === 0;
            },
            last: function(elem, i, match, array){
              return i === array.length - 1;
            },
            even: function(elem, i){
              return i % 2 === 0;
            },
            odd: function(elem, i){
              return i % 2 === 1;
            },
            lt: function(elem, i, match){
              return i < match[3] - 0;
            },
            gt: function(elem, i, match){
              return i > match[3] - 0;
            },
            nth: function(elem, i, match){
              return match[3] - 0 === i;
            },
            eq: function(elem, i, match){
              return match[3] - 0 === i;
            }
          },
          filter: {
            PSEUDO: function(elem, match, i, array){
              var name = match[1], filter = Expr.filters[ name ];

              if ( filter ) {
                return filter( elem, i, match, array );
              } else if ( name === "contains" ) {
                return (elem.textContent || elem.innerText || getText([ elem ]) || "").indexOf(match[3]) >= 0;
              } else if ( name === "not" ) {
                var not = match[3];

                for ( var i = 0, l = not.length; i < l; i++ ) {
                  if ( not[i] === elem ) {
                    return false;
                  }
                }

                return true;
              } else {
                Sizzle.error( "Syntax error, unrecognized expression: " + name );
              }
            },
            CHILD: function(elem, match){
              var type = match[1], node = elem;
              switch (type) {
              case 'only':
              case 'first':
                while ( (node = node.previousSibling) )	 {
                  if ( node.nodeType === 1 ) { 
                    return false; 
                  }
                }
                if ( type === "first" ) { 
                  return true; 
                }
                node = elem;
              case 'last':
                while ( (node = node.nextSibling) )	 {
                  if ( node.nodeType === 1 ) { 
                    return false; 
                  }
                }
                return true;
              case 'nth':
                var first = match[2], last = match[3];

                if ( first === 1 && last === 0 ) {
                  return true;
                }

                var doneName = match[0],
                parent = elem.parentNode;

                if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
                  var count = 0;
                  for ( node = parent.firstChild; node; node = node.nextSibling ) {
                    if ( node.nodeType === 1 ) {
                      node.nodeIndex = ++count;
                    }
                  } 
                  parent.sizcache = doneName;
                }

                var diff = elem.nodeIndex - last;
                if ( first === 0 ) {
                  return diff === 0;
                } else {
                  return ( diff % first === 0 && diff / first >= 0 );
                }
              }
            },
            ID: function(elem, match){
              return elem.nodeType === 1 && elem.getAttribute("id") === match;
            },
            TAG: function(elem, match){
              return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
            },
            CLASS: function(elem, match){
              return (" " + (elem.className || elem.getAttribute("class")) + " ")
              .indexOf( match ) > -1;
            },
            ATTR: function(elem, match){
              var name = match[1],
              result = Expr.attrHandle[ name ] ?
              Expr.attrHandle[ name ]( elem ) :
              elem[ name ] != null ?
              elem[ name ] :
              elem.getAttribute( name ),
              value = result + "",
              type = match[2],
              check = match[4];

              return result == null ?
              type === "!=" :
              type === "=" ?
              value === check :
              type === "*=" ?
              value.indexOf(check) >= 0 :
              type === "~=" ?
              (" " + value + " ").indexOf(check) >= 0 :
              !check ?
              value && result !== false :
              type === "!=" ?
              value !== check :
              type === "^=" ?
              value.indexOf(check) === 0 :
              type === "$=" ?
              value.substr(value.length - check.length) === check :
              type === "|=" ?
              value === check || value.substr(0, check.length + 1) === check + "-" :
              false;
            },
            POS: function(elem, match, i, array){
              var name = match[2], filter = Expr.setFilters[ name ];

              if ( filter ) {
                return filter( elem, i, match, array );
              }
            }
          }
        };

        var origPOS = Expr.match.POS;

        for ( var type in Expr.match ) {
          Expr.match[ type ] = new RegExp( Expr.match[ type ].source + /(?![^\[]*\])(?![^\(]*\))/.source );
          Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, function(all, num){
                return "\\" + (num - 0 + 1);
              }));
        }

        var makeArray = function(array, results) {
          array = Array.prototype.slice.call( array, 0 );

          if ( results ) {
            results.push.apply( results, array );
            return results;
          }

          return array;
        };

        // Perform a simple check to determine if the browser is capable of
        // converting a NodeList to an array using builtin methods.
        // Also verifies that the returned array holds DOM nodes
        // (which is not the case in the Blackberry browser)
        try {
          Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

          // Provide a fallback method if it does not work
        } catch(e){
          makeArray = function(array, results) {
            var ret = results || [];

            if ( toString.call(array) === "[object Array]" ) {
              Array.prototype.push.apply( ret, array );
            } else {
              if ( typeof array.length === "number" ) {
                for ( var i = 0, l = array.length; i < l; i++ ) {
                  ret.push( array[i] );
                }
              } else {
                for ( var i = 0; array[i]; i++ ) {
                  ret.push( array[i] );
                }
              }
            }

            return ret;
          };
        }

        var sortOrder;

        if ( document.documentElement.compareDocumentPosition ) {
          sortOrder = function( a, b ) {
            if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
              if ( a == b ) {
                hasDuplicate = true;
              }
              return a.compareDocumentPosition ? -1 : 1;
            }

            var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
            if ( ret === 0 ) {
              hasDuplicate = true;
            }
            return ret;
          };
        } else if ( "sourceIndex" in document.documentElement ) {
          sortOrder = function( a, b ) {
            if ( !a.sourceIndex || !b.sourceIndex ) {
              if ( a == b ) {
                hasDuplicate = true;
              }
              return a.sourceIndex ? -1 : 1;
            }

            var ret = a.sourceIndex - b.sourceIndex;
            if ( ret === 0 ) {
              hasDuplicate = true;
            }
            return ret;
          };
        } else if ( document.createRange ) {
          sortOrder = function( a, b ) {
            if ( !a.ownerDocument || !b.ownerDocument ) {
              if ( a == b ) {
                hasDuplicate = true;
              }
              return a.ownerDocument ? -1 : 1;
            }

            var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
            aRange.setStart(a, 0);
            aRange.setEnd(a, 0);
            bRange.setStart(b, 0);
            bRange.setEnd(b, 0);
            var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
            if ( ret === 0 ) {
              hasDuplicate = true;
            }
            return ret;
          };
        }

        // Utility function for retreiving the text value of an array of DOM nodes
        function getText( elems ) {
          var ret = "", elem;

          for ( var i = 0; elems[i]; i++ ) {
            elem = elems[i];

            // Get the text from text nodes and CDATA nodes
            if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
              ret += elem.nodeValue;

              // Traverse everything else, except comment nodes
            } else if ( elem.nodeType !== 8 ) {
              ret += getText( elem.childNodes );
            }
          }

          return ret;
        }

        // Check to see if the browser returns elements by name when
        // querying by getElementById (and provide a workaround)
        (function(){
            // We're going to inject a fake input element with a specified name
            var form = document.createElement("div"),
            id = "script" + (new Date).getTime();
            form.innerHTML = "<a name='" + id + "'/>";

            // Inject it into the root element, check its status, and remove it quickly
            var root = document.documentElement;
            root.insertBefore( form, root.firstChild );

            // The workaround has to do additional checks after a getElementById
            // Which slows things down for other browsers (hence the branching)
            if ( document.getElementById( id ) ) {
              Expr.find.ID = function(match, context, isXML){
                if ( typeof context.getElementById !== "undefined" && !isXML ) {
                  var m = context.getElementById(match[1]);
                  return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
                }
              };

              Expr.filter.ID = function(elem, match){
                var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                return elem.nodeType === 1 && node && node.nodeValue === match;
              };
            }

            root.removeChild( form );
            root = form = null; // release memory in IE
          })();

        (function(){
            // Check to see if the browser returns only elements
            // when doing getElementsByTagName("*")

            // Create a fake element
            var div = document.createElement("div");
            div.appendChild( document.createComment("") );

            // Make sure no comments are found
            if ( div.getElementsByTagName("*").length > 0 ) {
              Expr.find.TAG = function(match, context){
                var results = context.getElementsByTagName(match[1]);

                // Filter out possible comments
                if ( match[1] === "*" ) {
                  var tmp = [];

                  for ( var i = 0; results[i]; i++ ) {
                    if ( results[i].nodeType === 1 ) {
                      tmp.push( results[i] );
                    }
                  }

                  results = tmp;
                }

                return results;
              };
            }

            // Check to see if an attribute returns normalized href attributes
            div.innerHTML = "<a href='#'></a>";
            if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
              div.firstChild.getAttribute("href") !== "#" ) {
              Expr.attrHandle.href = function(elem){
                return elem.getAttribute("href", 2);
              };
            }

            div = null; // release memory in IE
          })();

        if ( document.querySelectorAll ) {
          (function(){
              var oldSizzle = Sizzle, div = document.createElement("div");
              div.innerHTML = "<p class='TEST'></p>";

              // Safari can't handle uppercase or unicode characters when
              // in quirks mode.
              if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
                return;
              }

              Sizzle = function(query, context, extra, seed){
                context = context || document;

                // Only use querySelectorAll on non-XML documents
                // (ID selectors don't work in non-HTML documents)
                if ( !seed && context.nodeType === 9 && !isXML(context) ) {
                  try {
                    return makeArray( context.querySelectorAll(query), extra );
                  } catch(e){}
                }

                return oldSizzle(query, context, extra, seed);
              };

              for ( var prop in oldSizzle ) {
                Sizzle[ prop ] = oldSizzle[ prop ];
              }

              div = null; // release memory in IE
            })();
        }

        (function(){
            var div = document.createElement("div");

            div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            // Opera can't find a second classname (in 9.6)
            // Also, make sure that getElementsByClassName actually exists
            if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
              return;
            }

            // Safari caches class attributes, doesn't catch changes (in 3.2)
            div.lastChild.className = "e";

            if ( div.getElementsByClassName("e").length === 1 ) {
              return;
            }

            Expr.order.splice(1, 0, "CLASS");
            Expr.find.CLASS = function(match, context, isXML) {
              if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
                return context.getElementsByClassName(match[1]);
              }
            };

            div = null; // release memory in IE
          })();

        function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
          for ( var i = 0, l = checkSet.length; i < l; i++ ) {
            var elem = checkSet[i];
            if ( elem ) {
              elem = elem[dir];
              var match = false;

              while ( elem ) {
                if ( elem.sizcache === doneName ) {
                  match = checkSet[elem.sizset];
                  break;
                }

                if ( elem.nodeType === 1 && !isXML ){
                  elem.sizcache = doneName;
                  elem.sizset = i;
                }

                if ( elem.nodeName.toLowerCase() === cur ) {
                  match = elem;
                  break;
                }

                elem = elem[dir];
              }

              checkSet[i] = match;
            }
          }
        }

        function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
          for ( var i = 0, l = checkSet.length; i < l; i++ ) {
            var elem = checkSet[i];
            if ( elem ) {
              elem = elem[dir];
              var match = false;

              while ( elem ) {
                if ( elem.sizcache === doneName ) {
                  match = checkSet[elem.sizset];
                  break;
                }

                if ( elem.nodeType === 1 ) {
                  if ( !isXML ) {
                    elem.sizcache = doneName;
                    elem.sizset = i;
                  }
                  if ( typeof cur !== "string" ) {
                    if ( elem === cur ) {
                      match = true;
                      break;
                    }

                  } else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
                    match = elem;
                    break;
                  }
                }

                elem = elem[dir];
              }

              checkSet[i] = match;
            }
          }
        }

        var contains = document.compareDocumentPosition ? function(a, b){
          return !!(a.compareDocumentPosition(b) & 16);
        } : function(a, b){
          return a !== b && (a.contains ? a.contains(b) : true);
        };

        var isXML = function(elem){
          // documentElement is verified for cases where it doesn't yet exist
          // (such as loading iframes in IE - #4833) 
          var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
          return documentElement ? documentElement.nodeName !== "HTML" : false;
        };

        var posProcess = function(selector, context){
          var tmpSet = [], later = "", match,
          root = context.nodeType ? [context] : context;

          // Position selectors must be done after the filter
          // And so must :not(positional) so we move all PSEUDOs to the end
          while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
            later += match[0];
            selector = selector.replace( Expr.match.PSEUDO, "" );
          }

          selector = Expr.relative[selector] ? selector + "*" : selector;

          for ( var i = 0, l = root.length; i < l; i++ ) {
            Sizzle( selector, root[i], tmpSet );
          }

          return Sizzle.filter( later, tmpSet );
        };

        return Sizzle;
      })();

  function NinjaScript() {
    //NinjaScript-wide configurations.  Currently, not very many
    this.config = {
      //This is the half-assed: it should be template of some sort
      messageWrapping: function(text, classes) {
        return "<div class='flash " + classes +"'><p>" + text + "</p></div>"
      },
      messageList: "#messages",
      busyLaziness: 200
    }


    this.behavior = this.goodBehavior
    this.tools = new Tools(this)
  }

  NinjaScript.prototype = {

    packageBehaviors: function(callback) {
      var types = {
        does: Behavior,
        chooses: Metabehavior,
        selects: Selectabehavior
      }
      result = callback(types)
      this.tools.enrich(this, result)
    },

    goodBehavior: function(dispatching) {
      var collection = this.tools.getRootCollection()
      for(var selector in dispatching) 
      {
        if(typeof dispatching[selector] == "undefined") {
          log("Selector " + selector + " not properly defined - ignoring")
        } 
        else {
          collection.addBehavior(selector, dispatching[selector])
        }
      }
      jQuery(window).load( function(){ Ninja.go() } )
    },

    badBehavior: function(nonsense) {
      throw new Error("Called Ninja.behavior() after Ninja.go() - don't do that.  'Go' means 'I'm done, please proceed'")
    },

    go: function() {
      if(this.behavior != this.misbehavior) {
        var rootOfDocument = this.tools.getRootOfDocument()
        rootOfDocument.bind("DOMSubtreeModified DOMNodeInserted thisChangedDOM", handleMutation);
        //If we ever receive either of the W3C DOMMutation events, we don't need our IE based
        //hack, so nerf it
        rootOfDocument.one("DOMSubtreeModified DOMNodeInserted", function(){
            Ninja.tools.detachSyntheticMutationEvents()
          })
        this.behavior = this.badBehavior
        this.tools.fireMutationEvent()
      }
    }
  }


  function Tools(ninja) {
    this.ninja = ninja
  }

  Tools.prototype = {
    //Handy JS things
    forEach: forEach,
    enrich: function(left, right) {
      return jQuery.extend(left, right)
    },
    ensureDefaults: function(config, defaults) {
      if(!config instanceof Object) {
        config = {}
      }
      return this.enrich(defaults, config)
    },
    //DOM and Events
    getRootOfDocument: function() {
      return jQuery("html") //document.firstChild)
    },
    clearRootCollection: function() {
      Ninja.behavior = Ninja.goodBehavior
      this.getRootOfDocument().data("ninja-behavior", null)
    },
    getRootCollection: function() {
      var rootOfDocument = this.getRootOfDocument()
      if(rootOfDocument.data("ninja-behavior") instanceof BehaviorCollection) {
        return rootOfDocument.data("ninja-behavior")
      }

      var collection = new BehaviorCollection()
      rootOfDocument.data("ninja-behavior", collection);
      return collection
    },
    suppressChangeEvents: function() {
      return new Behavior({
          events: {
            DOMSubtreeModified: function(e){},
            DOMNodeInserted: function(e){}
          }
        })
    },
    addMutationTargets: function(targets) {
      this.getRootCollection().addMutationTargets(targets)
    },
    fireMutationEvent: function() {
      this.getRootCollection().fireMutationEvent()
    },
    detachSyntheticMutationEvents: function() {
      this.getRootCollection().fireMutationEvent = function(){}
      this.getRootCollection().addMutationTargets = function(t){}
    },
    //HTML Utils
    copyAttributes: function(from, to, which) {
      var attributeList = []
      var attrs = []
      var match = new RegExp("^" + which.join("$|^") + "$")
      to = jQuery(to)
      this.forEach(from.attributes, function(att) {
          if(match.test(att.nodeName)) {
            to.attr(att.nodeName, att.nodeValue)
          }
        })
    },
    deriveElementsFrom: function(element, means){
      switch(typeof means){
      case 'undefined': return element
      case 'string': return jQuery(means)
      case 'function': return means(element)
      }
    },
    extractMethod: function(element, formData) {
      if(element.dataset !== undefined && 
        element.dataset["method"] !== undefined && 
        element.dataset["method"].length > 0) {
        log("Override via dataset: " + element.dataset["method"])
        return element.dataset["method"]
      }
      if(element.dataset === undefined && 
        jQuery(element).attr("data-method") !== undefined) {
        log("Override via data-method: " + jQuery(element).attr("data-method"))
        return jQuery(element).attr("data-method")
      }
      if(typeof formData !== "undefined") {
        for(var i=0, len = formData.length; i<len; i++) {
          if(formData[i].name == "Method") {
            log("Override via Method: " + formData[i].value)
            return formData[i].value
          }
        }
      }
      if(typeof element.method !== "undefined") {
        return element.method
      } 
      return "GET"
    },
    //Ninjascript utils
    cantTransform: function() {
      throw new TransformFailedException
    },
    applyBehaviors: function(element, behaviors) {
      this.getRootCollection().apply(element, behaviors)
    },
    message: function(text, classes) {
      var addingMessage = this.ninja.config.messageWrapping(text, classes)
      jQuery(this.ninja.config.messageList).append(addingMessage)
    },
    hiddenDiv: function() {
      var existing = jQuery("div#ninja-hide")
      if(existing.length > 0) {
        return existing[0]
      }

      var hide = jQuery("<div id='ninja-hide'></div>").css("display", "none")
      jQuery("body").append(hide)
      Ninja.tools.getRootCollection().applyBehaviorsTo(hide, [Ninja.tools.suppressChangeEvents()])
      return hide
    },
    ajaxSubmitter: function(form) {
      return new AjaxSubmitter(form)
    },
    overlay: function() {
      // I really liked using 
      //return new Overlay([].map.apply(arguments,[function(i) {return i}]))
      //but IE8 doesn't implement ECMA 2.6.2 5th ed.

      return new Overlay(jQuery.makeArray(arguments))
    },
    busyOverlay: function(elem) {
      var overlay = this.overlay(elem)
      overlay.set.addClass("ninja_busy")
      overlay.laziness = this.ninja.config.busyLaziness
      return overlay
    },
    //Currently, this doesn't respect changes to the original block...
    //There should be an "Overlay behavior" that gets applied
    buildOverlayFor: function(elem) {
      var overlay = jQuery(document.createElement("div"))
      var hideMe = jQuery(elem)
      var offset = hideMe.offset()
      overlay.css("position", "absolute")
      overlay.css("top", offset.top)
      overlay.css("left", offset.left)
      overlay.width(hideMe.outerWidth())
      overlay.height(hideMe.outerHeight())
      overlay.css("zIndex", "2")
      return overlay
    }
  }

  var Ninja = new NinjaScript();
  //Below here is the dojo - the engines that make NinjaScript work.
  //With any luck, only the helpful and curious should have call to keep
  //reading
  //

  function handleMutation(evnt) {
    Ninja.tools.getRootCollection().mutationEventTriggered(evnt);
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

  function Overlay(list) {
    var elements = this.convertToElementArray(list)
    this.laziness = 0
    var ov = this
    this.set = jQuery(jQuery.map(elements, function(element, idx) {
          return ov.buildOverlayFor(element)
        }))
  }

  Overlay.prototype = {
    convertToElementArray: function(list) {
      var h = this
      switch(typeof list) {
      case 'undefined': return []
      case 'boolean': return []
      case 'string': return h.convertToElementArray(jQuery(list))
      case 'function': return h.convertToElementArray(list())
      case 'object': {
          //IE8 barfs on 'list instanceof Element'
          if("focus" in list && "blur" in list && !("jquery" in list)) {
            return [list]
          }
          else if("length" in list && "0" in list) {
            var result = []
            forEach(list, function(element) {
                result = result.concat(h.convertToElementArray(element))
              })
            return result
          }
          else {
            return []
          }
        }
      }
    },

    buildOverlayFor: function(elem) {
      var overlay = jQuery(document.createElement("div"))
      var hideMe = jQuery(elem)
      var offset = hideMe.offset()
      overlay.css("position", "absolute")
      overlay.css("top", offset.top)
      overlay.css("left", offset.left)
      overlay.width(hideMe.outerWidth())
      overlay.height(hideMe.outerHeight())
      overlay.css("zIndex", "2")
      overlay.css("display", "none")
      return overlay[0]
    },
    affix: function() {
      this.set.appendTo(jQuery("body"))
      overlaySet = this.set
      window.setTimeout(function() {
          overlaySet.css("display", "block")
        }, this.laziness)
    },
    remove: function() {
      this.set.remove()
    }
  }

  function EventScribe() {
    this.handlers = {}
    this.currentElement = null
  }

  EventScribe.prototype = {
    makeHandlersRemove: function(element) {
      for(var eventName in this.handlers) {
        var handler = this.handlers[eventName]
        this.handlers[eventName] = function(eventRecord) {
          handler.call(this, eventRecord)
          jQuery(element).remove()
        }
      }
    },
    recordEventHandlers: function (context, behavior) {
      if(this.currentElement !== context.element) {
        if(this.currentElement !== null) {
          this.makeHandlersRemove(this.currentElement)
          this.applyEventHandlers(this.currentElement)
          this.handlers = {}
        }
        this.currentElement = context.element
      }
      for(var eventName in behavior.eventHandlers) {
        var oldHandler = this.handlers[eventName]
        if(typeof oldHandler == "undefined") {
          oldHandler = function(){return true}
        }
        this.handlers[eventName] = behavior.buildHandler(context, eventName, oldHandler)
      }
    },
    applyEventHandlers: function(element) {
      for(var eventName in this.handlers) {
        jQuery(element).bind(eventName, this.handlers[eventName])
      }
    }
  }

  function TransformFailedException(){}
  function CouldntChooseException() { }

  function RootContext() {
    this.stashedElements = []
    this.eventHandlerSet = {}
  }

  RootContext.prototype = Ninja.tools.enrich(
    new Tools(Ninja),
    {
      stash: function(element) {
        this.stashedElements.unshift(element)
      },
      clearStash: function() {
        this.stashedElements = []
      },
      //XXX Of concern: how do cascading events work out?
      //Should there be a first catch?  Or a "doesn't cascade" or something?
      cascadeEvent: function(event) {
        var formDiv = Ninja.tools.hiddenDiv()
        forEach(this.stashedElements, function(element) {
            var elem = jQuery(element)
            elem.data("ninja-visited", this)
            jQuery(formDiv).append(elem)
            elem.trigger(event)
          })
      },
      unbindHandlers: function() {
        var el = jQuery(this.element)
        for(eventName in this.eventHandlerSet) {
          el.unbind(eventName, this.eventHandlerSet[eventName])
        }
      }
  })

  function BehaviorCollection() {
    this.lexicalCount = 0
    this.eventQueue = []
    this.behaviors = {}
    this.selectors = []
    this.mutationTargets = []
    return this
  }

  BehaviorCollection.prototype = {
    //XXX: check if this is source of new slowdown
    addBehavior: function(selector, behavior) {
      if(isArray(behavior)) {
        forEach(behavior, function(behaves){
            this.addBehavior(selector, behaves)
          }, this)
      }
      else if(behavior instanceof Behavior) {
        this.insertBehavior(selector, behavior)
      } 
      else if(behavior instanceof Selectabehavior) {
        this.insertBehavior(selector, behavior)
      }
      else if(behavior instanceof Metabehavior) {
        this.insertBehavior(selector, behavior)
      }
      else if(typeof behavior == "function"){
        this.addBehavior(selector, behavior())
      }
      else {
        var behavior = new Behavior(behavior)
        this.addBehavior(selector, behavior)
      }
    },
    insertBehavior: function(selector, behavior) {
      behavior.lexicalOrder = this.lexicalCount
      this.lexicalCount += 1
      if(this.behaviors[selector] === undefined) {
        this.selectors.push(selector)
        this.behaviors[selector] = [behavior]
      }
      else {
        this.behaviors[selector].push(behavior)
      }
    },
    addMutationTargets: function(targets) {
      this.mutationTargets = this.mutationTargets.concat(target)
    },
    fireMutationEvent: function() {
      var targets = this.mutationTargets
      if (targets.length > 0 ) {
        for(var target = targets.shift(); 
          targets.length > 0; 
          target = targets.shift()) {
          jQuery(target).trigger("thisChangedDOM")
        }
      }
      else {
        Ninja.tools.getRootOfDocument().trigger("thisChangedDOM")
      }
    },
    mutationEventTriggered: function(evnt){
      if(this.eventQueue.length == 0){
        log("mutation event - first")
        this.enqueueEvent(evnt)
        this.handleQueue()
      }
      else {
        log("mutation event - queueing")
        this.enqueueEvent(evnt)
      }
    },
    enqueueEvent: function(evnt) {
      var eventCovered = false
      var uncovered = []
      forEach(this.eventQueue, function(val) {
          eventCovered = eventCovered || jQuery.contains(val.target, evnt.target)
          if (!(jQuery.contains(evnt.target, val.target))) {
            uncovered.push(val)
          }
        })
      if(!eventCovered) {
        uncovered.unshift(evnt)
        this.eventQueue = uncovered
      } 
    },
    handleQueue: function(){
      while (this.eventQueue.length != 0){
        this.applyAll(this.eventQueue[0].target)
        this.eventQueue.shift()
      }
    },
    applyBehaviorsTo: function(element, behaviors) {
      return this.applyBehaviorsInContext(new RootContext, element, behaviors)
    },
    applyBehaviorsInContext: function(context, element, behaviors) {
      var curContext, 
      applyList = [], 
      scribe = new EventScribe
      Ninja.tools.enrich(scribe.handlers, context.eventHandlerSet)

      behaviors = behaviors.sort(function(left, right) {
          if(left.priority != right.priority) {
            if(left.priority === undefined) {
              return -1
            }
            else if(right.priority === undefined) {
              return 1
            }
            else {
              return left.priority - right.priority
            }
          }
          else {
            return left.lexicalOrder - right.lexicalOrder
          }
        }
      )

      forEach(behaviors,
        function(behavior){
          //XXX This needs to have exception handling back
          try {
            curContext = behavior.inContext(context)
            element = behavior.applyTransform(curContext, element)

            context = curContext
            context.element = element

            scribe.recordEventHandlers(context, behavior)
          }
          catch(ex) {
            if(ex instanceof TransformFailedException) {
              log("!!! Transform failed")
            }
            else {
              log(ex)
              throw ex
            }
          }
        }
      )
      jQuery(element).data("ninja-visited", context)

      scribe.applyEventHandlers(element)
      Ninja.tools.enrich(context.eventHandlerSet, scribe.handlers)

      this.fireMutationEvent()

      return element
    },
    collectBehaviors: function(element, collection, behaviors) {
      forEach(behaviors, function(val) {
          try {
            collection.push(val.choose(element))
          }
          catch(ex) {
            if(ex instanceof CouldntChooseException) {
              log("!!! couldn't choose")
            }
            else {
              log(ex)
              throw(ex)
            }
          }
        })
    },
    //XXX Still doesn't quite handle the sub-behavior case - order of application
    apply: function(element, startBehaviors, selectorIndex) {
      var applicableBehaviors = [], len = this.selectors.length
      this.collectBehaviors(element, applicableBehaviors, startBehaviors)
      var context = jQuery(element).data('ninja-visited')
      if (!context) {
        if(typeof selectorIndex == "undefined") {
          selectorIndex = 0
        }
        for(var j = selectorIndex; j < len; j++) {
          if(jQuery(element).is(this.selectors[j])) {
            this.collectBehaviors(element, applicableBehaviors, this.behaviors[this.selectors[j]])
          }
        }
      this.applyBehaviorsTo(element, applicableBehaviors)
      }
      else {
        context.unbindHandlers()
        this.applyBehaviorsInContext(context, element, applicableBehaviors)
      }
    },
    applyAll: function(root){
      var len = this.selectors.length
      for(var i = 0; i < len; i++) {
        var collection = this

        //Sizzle?

        forEach(Sizzle( this.selectors[i], root), //an array, not a jQuery
          function(elem){
            if (!jQuery(elem).data("ninja-visited")) { //Pure optimization
              collection.apply(elem, [], i)
            }
          })


//        jQuery(root).find(this.selectors[i]).each( 
//          function(index, elem){
//            if (!jQuery(elem).data("ninja-visited")) { //Pure optimization
//              collection.apply(elem, [], i)
//            }
//          }
//        )
      }
    }
  }


    function Metabehavior(setup, callback) {
      setup(this)
      this.chooser = callback
    }

    Metabehavior.prototype = {
      choose: function(element) {
        var chosen = this.chooser(element)
        if(chosen !== undefined) {
          return chosen.choose(element)
        }
        else {
          throw new CouldntChooseException
        }
      }
    }

    //For these to be acceptable, I need to fit them into the pattern that
    //Ninja.behavior accepts...
    function Selectabehavior(menu) {
      this.menu = menu
    }

    Selectabehavior.prototype = {
      choose: function(element) {
        for(var selector in this.menu) {
          if(jQuery(element).is(selector)) {
            return this.menu[selector].choose(element)
          }
        }
        return null //XXX Should raise exception
      }
    }

    function Behavior(handlers) {
      this.helpers = {}
      this.eventHandlers = []
      this.lexicalOrder = 0
      this.priority = 0

      if (typeof handlers.transform == "function") {
        this.transform = handlers.transform
        delete handlers.transform
      }
      if (typeof handlers.helpers != "undefined"){
        this.helpers = handlers.helpers
        delete handlers.helpers
      }
      if (typeof handlers.priority != "undefined"){
        this.priority = handlers.priority
      }
      delete handlers.priority
      if (typeof handlers.events != "undefined") {
        this.eventHandlers = handlers.events
      } 
      else {
        this.eventHandlers = handlers
      }

      return this
    }
    Behavior.prototype = {   
      //XXX applyTo?
      apply: function(elem) {
        var context = this.inContext({})

        elem = this.applyTransform(context, elem)
        jQuery(elem).data("ninja-visited", context)

        this.applyEventHandlers(context, elem)

        return elem
      },
      priority: function(value) {
        this.priority = value
        return this
      },
      choose: function(element) {
        return this
      },
      inContext: function(basedOn) {
        function Context() {}
        Context.prototype = basedOn
        return Ninja.tools.enrich(new Context, this.helpers)
      },
      applyTransform: function(context, elem) {
        var previousElem = elem
        var newElem = this.transform.call(context, elem)
        if(newElem === undefined) {
          return previousElem
        }
        else {
          return newElem
        }
      },
      applyEventHandlers: function(context, elem) {
        for(var eventName in this.eventHandlers) {
          var handler = this.eventHandlers[eventName]
          jQuery(elem).bind(eventName, this.makeHandler.call(context, handler))
        }
        return elem
      },
      recordEventHandlers: function(scribe, context) {
        for(var eventName in this.eventHandlers) {
          scribe.recordHandler(this, eventName, function(oldHandler){
              return this.makeHandler.call(context, this.eventHandlers[eventName], oldHandler)
            }
          )
        }
      },
      buildHandler: function(context, eventName, previousHandler) {
        var handle
        var stopDefault = true
        var stopPropagate = true
        var stopImmediate = false
        var fireMutation = false
        var config = this.eventHandlers[eventName]

        if (typeof config == "function") {
          handle = config
        }
        else {
          handle = config[0]
          config = config.slice(1,config.length)
          var len = config.length
          for(var i = 0; i < len; i++) {
            if (config[i] == "andDoDefault" || config[i] == "allowDefault") {
              stopDefault = false
            }
            if (config[i] == "allowPropagate" || config[i] == "dontStopPropagation") {
              stopPropagate = false
            }
            //stopImmediatePropagation is a jQuery thing
            if (config[i] == "andDoOthers") {
              stopImmediate = false
            }
            if (config[i] == "changesDOM") {
              fireMutation = true
            }
          }
        }
        var handler = function(eventRecord) {
          handle.call(context, eventRecord, this, previousHandler)
          return !stopDefault
        }
        if(stopDefault) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.preventDefault()
            })
        }
        if(stopPropagate) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.stopPropagation()
            })
        }
        if (stopImmediate) {
          handler = this.prependAction(handler, function(eventRecord) {
              eventRecord.stopImmediatePropagation()
            })
        }
        if (fireMutation) {
          handler = this.appendAction(handler, function(eventRecord) {
              Ninja.tools.fireMutationEvent()
            })
        }

        return handler
      },
      prependAction: function(handler, doWhat) {
        return function(eventRecord) {
          doWhat.call(this, eventRecord)
          handler.call(this, eventRecord)
        }
      },
      appendAction: function(handler, doWhat) {
        return function(eventRecord) {
          handler.call(this, eventRecord)
          doWhat.call(this, eventRecord)
        }
      },
      transform: function(elem){ 
        return elem 
      }
    }

    return Ninja;  
  })();

(function() {
    function standardBehaviors(ninja){
      return {
        // START READING HERE
        //Stock behaviors

        //Converts either a link or a form to send its requests via AJAX - we eval
        //the Javascript we get back.  We get an busy overlay if configured to do
        //so.
        //
        //This farms out the actual behavior to submitsAsAjaxLink and
        //submitsAsAjaxForm, c.f.
        submitsAsAjax: function(configs) {
          return new ninja.chooses(function(meta) {
              meta.asLink = Ninja.submitsAsAjaxLink(configs),
              meta.asForm = Ninja.submitsAsAjaxForm(configs)
            },
            function(elem) {
              switch(elem.tagName.toLowerCase()) {
              case "a": return this.asLink
              case "form": return this.asForm
              }
            })
        },


        //Converts a link to send its GET request via Ajax - we assume that we get
        //Javascript back, which is eval'd.  While we're waiting, we'll throw up a
        //busy overlay if configured to do so.  By default, we don't use a busy
        //overlay.
        //
        //Ninja.submitAsAjaxLink({
        //  busyElement: function(elem) { elem.parent }
        //})
        //
        submitsAsAjaxLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: function(elem) {
                return $(elem).parents('address,blockquote,body,dd,div,p,dl,dt,table,form,ol,ul,tr')[0]
              }})

          return new ninja.does({
              priority: 10,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                click:  function(evnt) {
                  var overlay = this.busyOverlay(this.findOverlay(evnt.target))
                  var submitter = this.ajaxSubmitter()
                  submitter.action = evnt.target.href
                  submitter.method = this.extractMethod(evnt.target)

                  submitter.onResponse = function(xhr, statusTxt) {
                    overlay.remove()
                  }
                  overlay.affix()
                  submitter.submit()						
                }
              }
            })
        },

        //Converts a form to send its request via Ajax - we assume that we get
        //Javascript back, which is eval'd.  We pull the method from the form:
        //either from the method attribute itself, a data-method attribute or a
        //Method input. While we're waiting, we'll throw up a busy overlay if
        //configured to do so.  By default, we use the form itself as the busy
        //element.
        //
        //Ninja.submitAsAjaxForm({
        //  busyElement: function(elem) { elem.parent }
        //})
        //
        submitsAsAjaxForm: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs,
            { busyElement: undefined })

          return new ninja.does({
              priority: 20,
              helpers: {
                findOverlay: function(elem) {
                  return this.deriveElementsFrom(elem, configs.busyElement)
                }
              },
              events: {
                submit: function(evnt) {
                  var overlay = this.busyOverlay(this.findOverlay(evnt.target))
                  var submitter = this.ajaxSubmitter()
                  submitter.formData = jQuery(evnt.target).serializeArray()
                  submitter.action = evnt.target.action
                  submitter.method = this.extractMethod(evnt.target, submitter.formData)

                  submitter.onResponse = function(xhr, statusTxt) {
                    overlay.remove()
                  }
                  overlay.affix()
                  submitter.submit()
                }
              }
            })
        },


        //Converts a whole form into a link that submits via AJAX.  The intention
        //is that you create a <form> elements with hidden inputs and a single
        //submit button - then when we transform it, you don't lose anything in
        //terms of user interface.  Like submitsAsAjaxForm, it will put up a
        //busy overlay - by default we overlay the element itself
        //
        //this.becomesAjaxLink({
        //  busyElement: function(elem) { jQuery("#user-notification") }
        //})
        becomesAjaxLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              busyElement: undefined,
              retainAttributes: ["id", "class", "lang", "dir", "title", "data-.*"]
            })

          return [ Ninja.submitsAsAjax(configs), Ninja.becomesLink(configs) ]
        },

        //Replaces a form with a link - the text of the link is based on the Submit
        //input of the form.  The form itself is pulled out of the document until
        //the link is clicked, at which point, it gets stuffed back into the
        //document and submitted, so the link behaves exactly link submitting the
        //form with its default inputs.  The motivation is to use hidden-input-only
        //forms for POST interactions, which Javascript can convert into links if
        //you want.
        becomesLink: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              retainAttributes: ["id", "class", "lang", "dir", "title", "rel", "data-.*"]
            })

          return new ninja.does({
              priority: 30,
              transform: function(form){
                var linkText
                if ((images = jQuery('input[type=image]', form)).size() > 0){
                  image = images[0]
                  linkText = "<img src='" + image.src + "' alt='" + image.alt +"'";
                } 
                else if((submits = jQuery('input[type=submit]', form)).size() > 0) {
                  submit = submits[0]
                  if(submits.size() > 1) {
                    log("Multiple submits.  Using: " + submit)
                  }
                  linkText = submit.value
                } 
                else {
                  log("Couldn't find a submit input in form");
                  this.cantTransform()
                }

                var link = jQuery("<a rel='nofollow' href='#'>" + linkText + "</a>")
                this.copyAttributes(form, link, configs.retainAttributes)
                this.stash(jQuery(form).replaceWith(link))
                return link
              },
              events: {
                click: function(evnt, elem){
                  this.cascadeEvent("submit")
                }
              }
            })

        },

        //Use for elements that should be transient.  For instance, the default
        //behavior of failed AJAX calls is to insert a message into a
        //div#messages with a "flash" class.  You can use this behavior to have
        //those disappear after a few seconds.
        //
        //Configs:
        //{ lifetime: 10000, diesFor: 600 }

        decays: function(configs) {
          configs = Ninja.tools.ensureDefaults(configs, {
              lifetime: 10000,
              diesFor: 600
            })

          return new ninja.does({
              priority: 100,
              transform: function(elem) {
                jQuery(elem).delay(configs.lifetime).slideUp(configs.diesFor, function(){
                    jQuery(elem).remove()
                    Ninja.tools.fireMutationEvent()
                  })
              },
              events: {
                click:  [function(event) {
                    jQuery(this.element).remove();
                  }, "changesDOM"]
              }
            })
        }
      };
    }

    Ninja.packageBehaviors(standardBehaviors)
  })();

(function($){
    function uiBehaviors(ninja){
      function watermarkedSubmitter(inputBehavior) {
        return new ninja.does({
            priority: 1000,
            submit: [function(event, el, oldHandler) {
                inputBehavior.prepareForSubmit()
                oldHandler(event)
              }, "andDoDefault"]
          })
      }
      function isWatermarkedPassword(configs) {
        return new ninja.does({
            priority: 1000,
            helpers: {
              prepareForSubmit: function() {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).val('')
                }
              }
            },
            transform: function(element) {
              var label = $('label[for=' + $(element)[0].id + ']')
              if(label.length == 0) {
                this.cantTransform()
              }
              label.addClass('ninja_watermarked')
              this.watermarkText = label.text()

              var el = $(element)
              el.addClass('ninja_watermarked')
              el.val(this.watermarkText)
              el.attr("type", "text")

              this.applyBehaviors(el.parents('form')[0], [watermarkedSubmitter(this)])

              return element
            },
            events: {
              focus: function(event) {
                $(this.element).removeClass('ninja_watermarked').val('').attr("type", "password")
              },
              blur: function(event) {
                if($(this.element).val() == '') {
                  $(this.element).addClass('ninja_watermarked').val(this.watermarkText).attr("type", "text")
                }
              }
            }
          })
      }

      function isWatermarkedText(configs) {
        return new ninja.does({
            priority: 1000,
            helpers: {
              prepareForSubmit: function() {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).val('')
                }
              }
            },
            transform: function(element) {
              var label = $('label[for=' + $(element)[0].id + ']')
              if(label.length == 0) {
                this.cantTransform()
              }
              label.addClass('ninja_watermarked')
              this.watermarkText = label.text()
              var el = $(element)
              el.addClass('ninja_watermarked')
              el.val(this.watermarkText)

              this.applyBehaviors(el.parents('form')[0], [watermarkedSubmitter(this)])

              return element
            },
            events: {
              focus: function(event) {
                if($(this.element).hasClass('ninja_watermarked')) {
                  $(this.element).removeClass('ninja_watermarked').val('')
                }
              },
              blur: function(event) {
                if($(this.element).val() == '') {
                  $(this.element).addClass('ninja_watermarked').val(this.watermarkText)
                }
              }
            }
          })
      }

      return {
        isWatermarked: function(configs) {
          return new ninja.chooses(function(meta) {
              meta.asText = isWatermarkedText(configs)
              meta.asPassword = isWatermarkedPassword(configs)
            },
            function(elem) {
              if($(elem).is("input[type=text],textarea")) {
                return this.asText
              }
              //Seems IE has a thing about changing input types...
              //We'll get back to this one
              //              else if($(elem).is("input[type=password]")){
              //                return this.asPassword
              //              }
            })
        }
      }
    }

    Ninja.packageBehaviors(uiBehaviors)
  })(jQuery);


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
