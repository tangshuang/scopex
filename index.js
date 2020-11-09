'use strict';

var parse = require('angular-expressions/lib/parse.js');

function ScopeX(data) {
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

  var filters = {};
  var lexer = new Lexer({});
  var parser = new Parser(lexer, function getFilter(name) {
      return filters[name];
  }, parserOptions);
  var cache = {};

  /**
   * Compiles src and returns a function that executes src on a target object.
   * The compiled function is cached under cache[src] to speed up further calls.
   *
   * @param {string} src
   * @returns {function}
   */
  function compile(src) {
      var cached;

      if (typeof src !== 'string') {
          throw new TypeError('ScopeX need a string, but saw ' + typeof src);
      }

      cached = cache[src];
      if (!cached) {
          cached = cache[src] = parser.parse(src);
      }

      return cached;
  }

  this.filters = filters;
  this.compile = compile;
  this.data = data ? data : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
}

ScopeX.prototype.filter = function(name, fn) {
  this.filters[name] = fn;
};

ScopeX.prototype.parse = function(str) {
  return this.compile(str)(this.data);
};

ScopeX.prototype.assign = function(key, value) {
  var ev = this.compile(key);
  ev.assign(this.data, value);
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

ScopeX.prototype.$new = function(next) {
  var data = Object.assign({}, this.data, next && typeof next === 'object' ? next : {});
  return new ScopeX(data);
};

module.exports = ScopeX;
