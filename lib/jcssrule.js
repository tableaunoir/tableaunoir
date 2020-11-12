/*	Copyright (c) 2017 Jean-Marc VIGLINO, 
  released under MIT license
  (http://www.cecill.info/licences/Licence_CeCILL-B_V1-en.txt).
*/
/** @fileoverview A simple jQuery plugin to manipulate CSS styleSheet
 *	@see {@link https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript }
*  @author  Jean-Marc VIGLINO
*  @version 1.0
*/
(function () {
  // Create a new stylesheet in the bottom of the <body> 
  // or the <head> depending on the place of the file
  var stylesheet = document.createElement('style');
  stylesheet.setAttribute('type', 'text/css');
  if (document.body) document.body.appendChild(stylesheet);
  else document.head.appendChild(stylesheet);

  // List of rules
  var rules = [];

  // Get a rule
  function getRuleId (selector, property) {
    for (var i=0,r; r=rules[i]; i++) {
      if (r.selector==selector && r.property==property) return i;
    }
    return -1;
  }
  
  // Set a rule
  function setRule(selector, property, value) {
    var id = getRuleId (selector, property)
    if (id>=0) rules.splice(id, 1);
    if (value) rules.push({ 'selector':selector, 'property':property, 'value':value });
    return;
  }

  // Create the stylesheet
  function setSheet() {
    var css = '\n';	
    rules.forEach(function(r) {
      css += r.selector+' {'+r.property+':'+r.value+'; }\n';
    });
    stylesheet.innerHTML = css;
  }

  /** Manipulate CSS styleSheet. 
   *	The function will add a new property for the selector in a style sheet.
  *	The style sheet will be inserted where the js is placed and will override other css style sheets placed before.
  *
  *	@example 
  *	jCSSRule("body", "background","red");  // Change background color of the body
  *	jCSSRule("body", "background");			  // return "red"
  *	jCSSRule("body", {"background":"red", "color":"blue"});
  *	jCSSRule("body", "background",null);	  // Remove previous value
  *	jCSSRule("*", null);					          // Remove all values
  *
  *	@param {string} selector the selector to apply rule to
  *	@param {string|object} property a property or a key, value array of properties you want to set
  *	@param {string|null|undefined} value the value you want to set, if undefined will return the current value, if null remove the property
  *	@return {jQuery object|string} the object or the property value id value is undefined
  */
  window.jCSSRule = function (selector, property, value) {
    var p = property;
    // Reset properties
    if (selector === "*" && property === null) {
      rules = [];
      setSheet();
    } else if (property === undefined) {
      // Get all properties for the given selector
      var res = {};
      rules.forEach(function(r){
        if (r.selector===selector) {
          res[r.property] = r.value;
        }
      });
      return res;
    } else if (typeof(property) === 'string') {
      // Get the property
      if (value===undefined) {
        var id = getRuleId(selector,property);
        if (id<0) return null;
        else return rules[id].value;
      } else {
        // Set the property
        p = {};
        p[property] = value;
      }
    }
    // Add new properties to the sheet
    for (var i in p) {
      setRule(selector, i, p[i]);
    }
    setSheet();
  };
  
  /** Get a darker color
   * @param {string} color color string formated as #ffffff
   * @param {number} inc increment, default 5
   */
  jCSSRule.lightenColor = function(color, inc) {
    if (! typeof color === 'string' || color.charAt(0) !== '#') return color;
    var rgb=[], i, c = color.substr(1);
    if (c.length === 3) {
      for (i=0; i<3; i++) rgb[i] = c.charAt(i)+c.charAt(i);
    } else if (c.length === 6) {
      for (i=0; i<3; i++) rgb[i] = c.substr(i*2,2);
    } else {
      return color;
    }
    for (i=0; i<3; i++) rgb[i] = Math.max(0, Math.min(255, parseInt(rgb[i],16) + (inc||5)));
    return '#' 
      + ('0'+rgb[0].toString(16)).substr(-2)
      + ('0'+rgb[1].toString(16)).substr(-2)
      + ('0'+rgb[2].toString(16)).substr(-2);
  };

  /** Get a lighter color
   * @param {string} color color string formated as #ffffff
   * @param {number} inc increment, default -5
   */
  jCSSRule.darkenColor = function(color, inc) {
    return jCSSRule.lightenColor(color, -(inc||5));
  };

})();
