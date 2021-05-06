'use strict';

var parse = require('./parser.js');

function ScopeX(data, options) {
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

  var loose = options ? options.loose : false;
  var filters = options && options.filters ? Object.assign({}, options.filters) : {};

  var lexer = new Lexer({});
  var parser = new Parser(lexer, function getFilter(name) {
      return filters[name];
  }, parserOptions, loose);
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

  this.options = options;
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

ScopeX.prototype.$new = function(locals) {
  var data = {};

  if (locals) {
    var parent = this.data;
    var keys = Object.keys(parent).concat(Object.keys(locals));
    keys.forEach(function(key) {
      Object.defineProperty(data, key, {
        get: function() {
          return key in locals ? locals[key] : parent[key];
        },
        set: function(value) {
          if (key in locals) {
            return locals[key] = value;
          }
          else {
            return parent[key] = value;
          }
        },
        enumerable: true,
        configurable: true
      });
    });
  }
  else {
    Object.assign(data, this.data);
  }

  var scopex = new ScopeX(data, this.options);
  Object.assign(scopex.filters, this.filters);
  return scopex;
};

module.exports = ScopeX;
