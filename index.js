"use strict";

var parse = require("angular-expressions/lib/parse.js");

function ScopeX(scope) {
  var filters = {};
  var Lexer = parse.Lexer;
  var Parser = parse.Parser;
  var parserOptions = {
      csp: false, // noUnsafeEval,
      expensiveChecks: true,
      literals: { // defined at: function $ParseProvider() {
          true: true,
          false: false,
          null: null,
          /*eslint no-undefined: 0*/
          undefined: undefined
          /* eslint: no-undefined: 1  */
      }
      //isIdentifierStart: undefined, //isFunction(identStart) && identStart,
      //isIdentifierContinue: undefined //isFunction(identContinue) && identContinue
  };

  var lexer = new Lexer({});
  var parser = new Parser(lexer, function getFilter(name) {
      return filters[name];
  }, parserOptions);

  /**
   * Compiles src and returns a function that executes src on a target object.
   * The compiled function is cached under compile.cache[src] to speed up further calls.
   *
   * @param {string} src
   * @returns {function}
   */
  function compile(src) {
      var cached;

      if (typeof src !== "string") {
          throw new TypeError("ScopeX need a string, but saw '" + typeof src + "'");
      }

      if (!compile.cache) {
          return parser.parse(src);
      }

      cached = compile.cache[src];
      if (!cached) {
          cached = compile.cache[src] = parser.parse(src);
      }

      return cached;
  }

  /**
   * A cache containing all compiled functions. The src is used as key.
   * Set this on false to disable the cache.
   *
   * @type {object}
   */
  compile.cache = {};

  this.filters = filters;
  this.compile = compile;
  this.scope = scope ? scope : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
}

ScopeX.prototype.filter = function(name, fn) {
  this.filters[name] = fn;
};

ScopeX.prototype.parse = function(str) {
  return this.compile(str)(this.scope);
};

ScopeX.prototype.assign = function(key, value) {
  var ev = this.compile(key);
  ev.assign(this.scope, value);
};

ScopeX.prototype.interpolate = function(str) {
  var reg = new RegExp('\{\{(.*?)\}\}(?!\})', 'g');
  var matches = str.match(reg);

  // if there is no mustache, return the original string
  if (!matches) {
    return str;
  }

  var $this = this;
  // create a convert function
  function convert(content) {
    var exp = content.trim().slice(2, -2);
    var res = $this.parse(exp);
    return res;
  }

  str = str.replace(reg, convert);
  return str;
};

module.exports = ScopeX;
