;(function(fn) {
  var ScopeX = fn();
  // commonjs
  if (typeof exports !== 'undefined') {
    exports.default = ScopeX;
    exports.ScopeX = ScopeX;
    exports.createScope = ScopeX.createScope;
    exports.__esModule = true;
  }
  // in browser
  else if (typeof window !== 'undefined') {
    window.ScopeX = ScopeX;
  }
  // in webworker
  else if (typeof self !== 'undefined') {
    self.ScopeX = ScopeX;
  }
})(function() {

// fork from https://github.com/peerigon/angular-expressions/blob/master/lib/parse.js

/* remove eslint errors to see if there is something really wrong */
/*eslint quotes: [0]*/
/*eslint indent: [0]*/
/*eslint vars-on-top: [0]*/
/*eslint yoda: 0*/
/*eslint curly: 0*/
/*eslint no-implicit-coercion: 0*/
/*eslint newline-after-var: 0*/
/*eslint space-before-function-paren: 0*/
/*eslint block-spacing: 0*/
/*eslint brace-style: 0*/
/*eslint complexity: 0*/
/*eslint one-var: 0*/
/*eslint eqeqeq: 0*/
/*eslint object-curly-spacing: 0*/
/*eslint quote-props: 0*/
/*eslint key-spacing: 0*/
/*eslint valid-jsdoc: 0*/
/*eslint func-style: 0*/
/*eslint no-nested-ternary: 0*/
/*eslint operator-linebreak: 0*/
/*eslint no-multi-spaces: 0*/
/*eslint no-constant-condition: 0*/
/*eslint comma-spacing: 0*/
/*eslint no-else-return: 0*/
/*eslint no-warning-comments: 0*/
/*eslint default-case: 0*/
/*eslint consistent-return: 0*/
/*eslint no-undefined: 0*/
/*eslint no-new-func: 0*/
/*eslint max-nested-callbacks: 0*/
/*eslint padded-blocks: 0*/
/*eslint no-self-compare: 0*/
/*eslint no-multiple-empty-lines: 0*/
/*eslint no-new: 0*/
/*eslint no-unused-vars: 0*/

"use strict";

var window = { document: {} };

////////////////////////////////////

/**
 * @ngdoc module
 * @name ng
 * @module ng
 * @installation
 * @description
 *
 * # ng (core module)
 * The ng module is loaded by default when an AngularJS application is started. The module itself
 * contains the essential components for an AngularJS application to function. The table below
 * lists a high level breakdown of each of the services/factories, filters, directives and testing
 * components available within this core module.
 *
 * <div doc-module-components="ng"></div>
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;

var lowercase = function (string) {
  return isString(string) ? string.toLowerCase() : string;
};

/**
 * @ngdoc function
 * @name angular.isArray
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Array`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Array`.
 */
var isArray = Array.isArray;

var ngAttrPrefixes = ["ng-", "data-ng-", "ng:", "x-ng-"];

var manualLowercase = function (s) {
  /* eslint-disable no-bitwise */
  return isString(s)
    ? s.replace(/[A-Z]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) | 32);
      })
    : s;
  /* eslint-enable */
};
var manualUppercase = function (s) {
  /* eslint-disable no-bitwise */
  return isString(s)
    ? s.replace(/[a-z]/g, function (ch) {
        return String.fromCharCode(ch.charCodeAt(0) & ~32);
      })
    : s;
  /* eslint-enable */
};

// String#toLowerCase and String#toUpperCase don't produce correct results in browsers with Turkish
// locale, for this reason we need to detect this case and redefine lowercase/uppercase methods
// with correct but slower alternatives. See https://github.com/angular/angular.js/issues/11387
if ("i" !== "I".toLowerCase()) {
  lowercase = manualLowercase;
  uppercase = manualUppercase;
}

var jqLite, // delay binding since jQuery could be loaded after us.
  jQuery, // delay binding
  toString = Object.prototype.toString,
  getPrototypeOf = Object.getPrototypeOf,
  ngMinErr = minErr("ng"),
  /** @name angular */
  angular = window.angular || (window.angular = {}),
  uid = 0;

/**
 * @private
 * @param {*} obj
 * @return {boolean} Returns true if `obj` is an array or array-like object (NodeList, Arguments,
 *                   String ...)
 */
function isArrayLike(obj) {
  // `null`, `undefined` and `window` are not array-like
  if (obj == null || isWindow(obj)) return false;

  // arrays, strings and jQuery/jqLite objects are array like
  // * jqLite is either the jQuery or jqLite constructor function
  // * we have to check the existence of jqLite first as this method is called
  //   via the forEach method when constructing the jqLite object in the first place
  if (isArray(obj) || isString(obj) || (jqLite && obj instanceof jqLite))
    return true;

  // Support: iOS 8.2 (not reproducible in simulator)
  // "length" in obj used to prevent JIT error (gh-11508)
  var length = "length" in Object(obj) && obj.length;

  // NodeList objects (with `item` method) and
  // other objects with suitable length characteristics are array-like
  return (
    isNumber(length) &&
    ((length >= 0 && (length - 1 in obj || obj instanceof Array)) ||
      typeof obj.item === "function")
  );
}

/**
 * @ngdoc function
 * @name angular.forEach
 * @module ng
 * @kind function
 *
 * @description
 * Invokes the `iterator` function once for each item in `obj` collection, which can be either an
 * object or an array. The `iterator` function is invoked with `iterator(value, key, obj)`, where `value`
 * is the value of an object property or an array element, `key` is the object property key or
 * array element index and obj is the `obj` itself. Specifying a `context` for the function is optional.
 *
 * It is worth noting that `.forEach` does not iterate over inherited properties because it filters
 * using the `hasOwnProperty` method.
 *
 * Unlike ES262's
 * [Array.prototype.forEach](http://www.ecma-international.org/ecma-262/5.1/#sec-15.4.4.18),
 * providing 'undefined' or 'null' values for `obj` will not throw a TypeError, but rather just
 * return the value provided.
 *
   ```js
     var values = {name: 'misko', gender: 'male'};
     var log = [];
     angular.forEach(values, function(value, key) {
       this.push(key + ': ' + value);
     }, log);
     expect(log).toEqual(['name: misko', 'gender: male']);
   ```
 *
 * @param {Object|Array} obj Object to iterate over.
 * @param {Function} iterator Iterator function.
 * @param {Object=} context Object to become context (`this`) for the iterator function.
 * @returns {Object|Array} Reference to `obj`.
 */
function forEach(obj, iterator, context) {
  var key, length;
  if (obj) {
    if (isFunction(obj)) {
      for (key in obj) {
        if (
          key !== "prototype" &&
          key !== "length" &&
          key !== "name" &&
          obj.hasOwnProperty(key)
        ) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (isArray(obj) || isArrayLike(obj)) {
      var isPrimitive = typeof obj !== "object";
      for (key = 0, length = obj.length; key < length; key++) {
        if (isPrimitive || key in obj) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else if (obj.forEach && obj.forEach !== forEach) {
      obj.forEach(iterator, context, obj);
    } else if (isBlankObject(obj)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      // eslint-disable-next-line guard-for-in
      for (key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    } else if (typeof obj.hasOwnProperty === "function") {
      // Slow path for objects inheriting Object.prototype, hasOwnProperty check needed
      for (key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    } else {
      // Slow path for objects which do not have a method `hasOwnProperty`
      for (key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  }
  return obj;
}

/**
 * Set or clear the hashkey for an object.
 * @param obj object
 * @param h the hashkey (!truthy to delete the hashkey)
 */
function setHashKey(obj, h) {
  if (h) {
    obj.$$hashKey = h;
  } else {
    delete obj.$$hashKey;
  }
}

/**
 * @ngdoc function
 * @name angular.noop
 * @module ng
 * @kind function
 *
 * @description
 * A function that performs no operations. This function can be useful when writing code in the
 * functional style.
   ```js
     function foo(callback) {
       var result = calculateResult();
       (callback || angular.noop)(result);
     }
   ```
 */
function noop() {}
noop.$inject = [];

/**
 * @ngdoc function
 * @name angular.isUndefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is undefined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is undefined.
 */
function isUndefined(value) {
  return typeof value === "undefined";
}

/**
 * @ngdoc function
 * @name angular.isDefined
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is defined.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is defined.
 */
function isDefined(value) {
  return typeof value !== "undefined";
}

/**
 * @ngdoc function
 * @name angular.isObject
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is an `Object`. Unlike `typeof` in JavaScript, `null`s are not
 * considered to be objects. Note that JavaScript arrays are objects.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is an `Object` but not `null`.
 */
function isObject(value) {
  // http://jsperf.com/isobject4
  return value !== null && typeof value === "object";
}

/**
 * Determine if a value is an object with a null prototype
 *
 * @returns {boolean} True if `value` is an `Object` with a null prototype
 */
function isBlankObject(value) {
  return value !== null && typeof value === "object" && !getPrototypeOf(value);
}

/**
 * @ngdoc function
 * @name angular.isString
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `String`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `String`.
 */
function isString(value) {
  return typeof value === "string";
}

/**
 * @ngdoc function
 * @name angular.isNumber
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Number`.
 *
 * This includes the "special" numbers `NaN`, `+Infinity` and `-Infinity`.
 *
 * If you wish to exclude these then you can use the native
 * [`isFinite'](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isFinite)
 * method.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Number`.
 */
function isNumber(value) {
  return typeof value === "number";
}

/**
 * @ngdoc function
 * @name angular.isFunction
 * @module ng
 * @kind function
 *
 * @description
 * Determines if a reference is a `Function`.
 *
 * @param {*} value Reference to check.
 * @returns {boolean} True if `value` is a `Function`.
 */
function isFunction(value) {
  return typeof value === "function";
}

/**
 * Checks if `obj` is a window object.
 *
 * @private
 * @param {*} obj Object to check
 * @returns {boolean} True if `obj` is a window obj.
 */
function isWindow(obj) {
  return obj && obj.window === obj;
}

function isScope(obj) {
  return obj && obj.$evalAsync && obj.$watch;
}

var TYPED_ARRAY_REGEXP = /^\[object (?:Uint8|Uint8Clamped|Uint16|Uint32|Int8|Int16|Int32|Float32|Float64)Array\]$/;
function isTypedArray(value) {
  return (
    value &&
    isNumber(value.length) &&
    TYPED_ARRAY_REGEXP.test(toString.call(value))
  );
}

function isArrayBuffer(obj) {
  return toString.call(obj) === "[object ArrayBuffer]";
}

/**
 * @ngdoc function
 * @name angular.copy
 * @module ng
 * @kind function
 *
 * @description
 * Creates a deep copy of `source`, which should be an object or an array.
 *
 * * If no destination is supplied, a copy of the object or array is created.
 * * If a destination is provided, all of its elements (for arrays) or properties (for objects)
 *   are deleted and then all elements/properties from the source are copied to it.
 * * If `source` is not an object or array (inc. `null` and `undefined`), `source` is returned.
 * * If `source` is identical to `destination` an exception will be thrown.
 *
 * <br />
 * <div class="alert alert-warning">
 *   Only enumerable properties are taken into account. Non-enumerable properties (both on `source`
 *   and on `destination`) will be ignored.
 * </div>
 *
 * @param {*} source The source that will be used to make a copy.
 *                   Can be any type, including primitives, `null`, and `undefined`.
 * @param {(Object|Array)=} destination Destination into which the source is copied. If
 *     provided, must be of the same type as `source`.
 * @returns {*} The copy or updated `destination`, if `destination` was specified.
 *
 * @example
  <example module="copyExample" name="angular-copy">
    <file name="index.html">
      <div ng-controller="ExampleController">
        <form novalidate class="simple-form">
          <label>Name: <input type="text" ng-model="user.name" /></label><br />
          <label>Age:  <input type="number" ng-model="user.age" /></label><br />
          Gender: <label><input type="radio" ng-model="user.gender" value="male" />male</label>
                  <label><input type="radio" ng-model="user.gender" value="female" />female</label><br />
          <button ng-click="reset()">RESET</button>
          <button ng-click="update(user)">SAVE</button>
        </form>
        <pre>form = {{user | json}}</pre>
        <pre>master = {{master | json}}</pre>
      </div>
    </file>
    <file name="script.js">
      // Module: copyExample
      angular.
        module('copyExample', []).
        controller('ExampleController', ['$scope', function($scope) {
          $scope.master = {};

          $scope.reset = function() {
            // Example with 1 argument
            $scope.user = angular.copy($scope.master);
          };

          $scope.update = function(user) {
            // Example with 2 arguments
            angular.copy(user, $scope.master);
          };

          $scope.reset();
        }]);
    </file>
  </example>
 */
function copy(source, destination) {
  var stackSource = [];
  var stackDest = [];

  if (destination) {
    if (isTypedArray(destination) || isArrayBuffer(destination)) {
      throw ngMinErr(
        "cpta",
        "Can't copy! TypedArray destination cannot be mutated."
      );
    }
    if (source === destination) {
      throw ngMinErr(
        "cpi",
        "Can't copy! Source and destination are identical."
      );
    }

    // Empty the destination object
    if (isArray(destination)) {
      destination.length = 0;
    } else {
      forEach(destination, function (value, key) {
        if (key !== "$$hashKey") {
          delete destination[key];
        }
      });
    }

    stackSource.push(source);
    stackDest.push(destination);
    return copyRecurse(source, destination);
  }

  return copyElement(source);

  function copyRecurse(source, destination) {
    var h = destination.$$hashKey;
    var key;
    if (isArray(source)) {
      for (var i = 0, ii = source.length; i < ii; i++) {
        destination.push(copyElement(source[i]));
      }
    } else if (isBlankObject(source)) {
      // createMap() fast path --- Safe to avoid hasOwnProperty check because prototype chain is empty
      // eslint-disable-next-line guard-for-in
      for (key in source) {
        destination[key] = copyElement(source[key]);
      }
    } else if (source && typeof source.hasOwnProperty === "function") {
      // Slow path, which must rely on hasOwnProperty
      for (key in source) {
        if (source.hasOwnProperty(key)) {
          destination[key] = copyElement(source[key]);
        }
      }
    } else {
      // Slowest path --- hasOwnProperty can't be called as a method
      for (key in source) {
        if (hasOwnProperty.call(source, key)) {
          destination[key] = copyElement(source[key]);
        }
      }
    }
    setHashKey(destination, h);
    return destination;
  }

  function copyElement(source) {
    // Simple values
    if (!isObject(source)) {
      return source;
    }

    // Already copied values
    var index = stackSource.indexOf(source);
    if (index !== -1) {
      return stackDest[index];
    }

    if (isWindow(source) || isScope(source)) {
      throw ngMinErr(
        "cpws",
        "Can't copy! Making copies of Window or Scope instances is not supported."
      );
    }

    var needsRecurse = false;
    var destination = copyType(source);

    if (destination === undefined) {
      destination = isArray(source)
        ? []
        : Object.create(getPrototypeOf(source));
      needsRecurse = true;
    }

    stackSource.push(source);
    stackDest.push(destination);

    return needsRecurse ? copyRecurse(source, destination) : destination;
  }

  function copyType(source) {
    switch (toString.call(source)) {
      case "[object Int8Array]":
      case "[object Int16Array]":
      case "[object Int32Array]":
      case "[object Float32Array]":
      case "[object Float64Array]":
      case "[object Uint8Array]":
      case "[object Uint8ClampedArray]":
      case "[object Uint16Array]":
      case "[object Uint32Array]":
        return new source.constructor(
          copyElement(source.buffer),
          source.byteOffset,
          source.length
        );

      case "[object ArrayBuffer]":
        // Support: IE10
        if (!source.slice) {
          // If we're in this case we know the environment supports ArrayBuffer
          /* eslint-disable no-undef */
          var copied = new ArrayBuffer(source.byteLength);
          new Uint8Array(copied).set(new Uint8Array(source));
          /* eslint-enable */
          return copied;
        }
        return source.slice(0);

      case "[object Boolean]":
      case "[object Number]":
      case "[object String]":
      case "[object Date]":
        return new source.constructor(source.valueOf());

      case "[object RegExp]":
        var re = new RegExp(
          source.source,
          source.toString().match(/[^\/]*$/)[0]
        );
        re.lastIndex = source.lastIndex;
        return re;

      case "[object Blob]":
        return new source.constructor([source], { type: source.type });
    }

    if (isFunction(source.cloneNode)) {
      return source.cloneNode(true);
    }
  }
}

/**
 * @ngdoc directive
 * @module ng
 * @name ngJq
 *
 * @element ANY
 * @param {string=} ngJq the name of the library available under `window`
 * to be used for angular.element
 * @description
 * Use this directive to force the angular.element library.  This should be
 * used to force either jqLite by leaving ng-jq blank or setting the name of
 * the jquery variable under window (eg. jQuery).
 *
 * Since angular looks for this directive when it is loaded (doesn't wait for the
 * DOMContentLoaded event), it must be placed on an element that comes before the script
 * which loads angular. Also, only the first instance of `ng-jq` will be used and all
 * others ignored.
 *
 * @example
 * This example shows how to force jqLite using the `ngJq` directive to the `html` tag.
 ```html
 <!doctype html>
 <html ng-app ng-jq>
 ...
 ...
 </html>
 ```
 * @example
 * This example shows how to use a jQuery based library of a different name.
 * The library name must be available at the top most 'window'.
 ```html
 <!doctype html>
 <html ng-app ng-jq="jQueryLib">
 ...
 ...
 </html>
 ```
 */
var jq = function () {
  if (isDefined(jq.name_)) return jq.name_;
  var el;
  var i,
    ii = ngAttrPrefixes.length,
    prefix,
    name;
  for (i = 0; i < ii; ++i) {
    prefix = ngAttrPrefixes[i];
    el = window.document.querySelector(
      "[" + prefix.replace(":", "\\:") + "jq]"
    );
    if (el) {
      name = el.getAttribute(prefix + "jq");
      break;
    }
  }

  return (jq.name_ = name);
};


function toJsonReplacer(key, value) {
  var val = value;

  if (
    typeof key === "string" &&
    key.charAt(0) === "$" &&
    key.charAt(1) === "$"
  ) {
    val = undefined;
  } else if (isWindow(value)) {
    val = "$WINDOW";
  } else if (value && window.document === value) {
    val = "$DOCUMENT";
  } else if (isScope(value)) {
    val = "$SCOPE";
  }

  return val;
}

/////////////////////////////////////////////////

/**
 * Creates a new object without a prototype. This object is useful for lookup without having to
 * guard against prototypically inherited properties via hasOwnProperty.
 *
 * Related micro-benchmarks:
 * - http://jsperf.com/object-create2
 * - http://jsperf.com/proto-map-lookup/2
 * - http://jsperf.com/for-in-vs-object-keys2
 *
 * @returns {Object}
 */
function createMap() {
  return Object.create(null);
}

/* global toDebugString: true */

function serializeObject(obj) {
  var seen = [];

  return JSON.stringify(obj, function (key, val) {
    val = toJsonReplacer(key, val);
    if (isObject(val)) {
      if (seen.indexOf(val) >= 0) return "...";

      seen.push(val);
    }
    return val;
  });
}

function toDebugString(obj) {
  if (typeof obj === "function") {
    return obj.toString().replace(/ \{[\s\S]*$/, "");
  } else if (isUndefined(obj)) {
    return "undefined";
  } else if (typeof obj !== "string") {
    return serializeObject(obj);
  }
  return obj;
}

/**
 * @description
 *
 * This object provides a utility for producing rich Error messages within
 * Angular. It can be called as follows:
 *
 * var exampleMinErr = minErr('example');
 * throw exampleMinErr('one', 'This {0} is {1}', foo, bar);
 *
 * The above creates an instance of minErr in the example namespace. The
 * resulting error will have a namespaced error code of example.one.  The
 * resulting error will replace {0} with the value of foo, and {1} with the
 * value of bar. The object is not restricted in the number of arguments it can
 * take.
 *
 * If fewer arguments are specified than necessary for interpolation, the extra
 * interpolation markers will be preserved in the final string.
 *
 * Since data will be parsed statically during a build step, some restrictions
 * are applied with respect to how minErr instances are created and called.
 * Instances should have names of the form namespaceMinErr for a minErr created
 * using minErr('namespace') . Error codes, namespaces and template strings
 * should all be static strings, not variables or general expressions.
 *
 * @param {string} module The namespace to use for the new minErr instance.
 * @param {function} ErrorConstructor Custom error constructor to be instantiated when returning
 *   error from returned function, for cases when a particular type of error is useful.
 * @returns {function(code:string, template:string, ...templateArgs): Error} minErr instance
 */

function minErr(module, ErrorConstructor) {
  ErrorConstructor = ErrorConstructor || Error;
  return function () {
    var SKIP_INDEXES = 2;

    var templateArgs = arguments,
      code = templateArgs[0],
      message = "[" + (module ? module + ":" : "") + code + "] ",
      template = templateArgs[1],
      paramPrefix,
      i;

    message += template.replace(/\{\d+\}/g, function (match) {
      var index = +match.slice(1, -1),
        shiftedIndex = index + SKIP_INDEXES;

      if (shiftedIndex < templateArgs.length) {
        return toDebugString(templateArgs[shiftedIndex]);
      }

      return match;
    });

    message +=
      '\nhttp://errors.angularjs.org/1.6.9/' +
      (module ? module + "/" : "") +
      code;

    for (
      i = SKIP_INDEXES, paramPrefix = "?";
      i < templateArgs.length;
      i++, paramPrefix = "&"
    ) {
      message +=
        paramPrefix +
        "p" +
        (i - SKIP_INDEXES) +
        "=" +
        encodeURIComponent(toDebugString(templateArgs[i]));
    }

    return new ErrorConstructor(message);
  };
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 *     Any commits to this file should be reviewed with security in mind.  *
 *   Changes to this file can potentially create security vulnerabilities. *
 *          An approval from 2 Core members with history of modifying      *
 *                         this file is required.                          *
 *                                                                         *
 *  Does the change somehow allow for arbitrary javascript to be executed? *
 *    Or allows for someone to change the prototype of built-in objects?   *
 *     Or gives undesired access to variables likes document or window?    *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

var $parseMinErr = minErr("$parse");

// Sandboxing Angular Expressions
// ------------------------------
// Angular expressions are no longer sandboxed. So it is now even easier to access arbitrary JS code by
// various means such as obtaining a reference to native JS functions like the Function constructor.
//
// As an example, consider the following Angular expression:
//
//   {}.toString.constructor('alert("evil JS code")')
//
// It is important to realize that if you create an expression from a string that contains user provided
// content then it is possible that your application contains a security vulnerability to an XSS style attack.
//
// See https://docs.angularjs.org/guide/security

function getStringValue(name) {
  // Property names must be strings. This means that non-string objects cannot be used
  // as keys in an object. Any non-string object, including a number, is typecasted
  // into a string via the toString method.
  // -- MDN, https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/Property_accessors#Property_names
  //
  // So, to ensure that we are checking the same `name` that JavaScript would use, we cast it
  // to a string. It's not always possible. If `name` is an object and its `toString` method is
  // 'broken' (doesn't return a string, isn't a function, etc.), an error will be thrown:
  //
  // TypeError: Cannot convert object to primitive value
  //
  // For performance reasons, we don't catch this error here and allow it to propagate up the call
  // stack. Note that you'll get the same error in JavaScript if you try to access a property using
  // such a 'broken' object as a key.
  return name + "";
}

var OPERATORS = createMap();
forEach(
  "+ - * / % === !== == != < > <= >= && || ! = |".split(" "),
  function (operator) {
    OPERATORS[operator] = true;
  }
);
var ESCAPE = {
  n: "\n",
  f: "\f",
  r: "\r",
  t: "\t",
  v: "\v",
  "'": "'",
  '"': '"',
};

/////////////////////////////////////////

/**
 * @constructor
 */
function Lexer(options) {
  this.options = options;
};

Lexer.prototype = {
  constructor: Lexer,

  lex: function (text) {
    this.text = text;
    this.index = 0;
    this.tokens = [];

    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      if (ch === '"' || ch === "'") {
        this.readString(ch);
      } else if (
        this.isNumber(ch) ||
        (ch === "." && this.isNumber(this.peek()))
      ) {
        this.readNumber();
      } else if (this.isIdentifierStart(this.peekMultichar())) {
        this.readIdent();
      } else if (this.is(ch, "(){}[].,;:?")) {
        this.tokens.push({ index: this.index, text: ch });
        this.index++;
      } else if (this.isWhitespace(ch)) {
        this.index++;
      } else {
        var ch2 = ch + this.peek();
        var ch3 = ch2 + this.peek(2);
        var op1 = OPERATORS[ch];
        var op2 = OPERATORS[ch2];
        var op3 = OPERATORS[ch3];
        if (op1 || op2 || op3) {
          var token = op3 ? ch3 : op2 ? ch2 : ch;
          this.tokens.push({ index: this.index, text: token, operator: true });
          this.index += token.length;
        } else {
          this.throwError(
            "Unexpected next character ",
            this.index,
            this.index + 1
          );
        }
      }
    }
    return this.tokens;
  },

  is: function (ch, chars) {
    return chars.indexOf(ch) !== -1;
  },

  peek: function (i) {
    var num = i || 1;
    return this.index + num < this.text.length
      ? this.text.charAt(this.index + num)
      : false;
  },

  isNumber: function (ch) {
    return "0" <= ch && ch <= "9" && typeof ch === "string";
  },

  isWhitespace: function (ch) {
    // IE treats non-breaking space as \u00A0
    return (
      ch === " " ||
      ch === "\r" ||
      ch === "\t" ||
      ch === "\n" ||
      ch === "\v" ||
      ch === "\u00A0"
    );
  },

  isIdentifierStart: function (ch) {
    return this.options.isIdentifierStart
      ? this.options.isIdentifierStart(ch, this.codePointAt(ch))
      : this.isValidIdentifierStart(ch);
  },

  isValidIdentifierStart: function (ch) {
    return (
      ("a" <= ch && ch <= "z") ||
      ("A" <= ch && ch <= "Z") ||
      "_" === ch ||
      ch === "$"
    );
  },

  isIdentifierContinue: function (ch) {
    return this.options.isIdentifierContinue
      ? this.options.isIdentifierContinue(ch, this.codePointAt(ch))
      : this.isValidIdentifierContinue(ch);
  },

  isValidIdentifierContinue: function (ch, cp) {
    return this.isValidIdentifierStart(ch, cp) || this.isNumber(ch);
  },

  codePointAt: function (ch) {
    if (ch.length === 1) return ch.charCodeAt(0);
    // eslint-disable-next-line no-bitwise
    return (ch.charCodeAt(0) << 10) + ch.charCodeAt(1) - 0x35fdc00;
  },

  peekMultichar: function () {
    var ch = this.text.charAt(this.index);
    var peek = this.peek();
    if (!peek) {
      return ch;
    }
    var cp1 = ch.charCodeAt(0);
    var cp2 = peek.charCodeAt(0);
    if (cp1 >= 0xd800 && cp1 <= 0xdbff && cp2 >= 0xdc00 && cp2 <= 0xdfff) {
      return ch + peek;
    }
    return ch;
  },

  isExpOperator: function (ch) {
    return ch === "-" || ch === "+" || this.isNumber(ch);
  },

  throwError: function (error, start, end) {
    end = end || this.index;
    var colStr = isDefined(start)
      ? "s " +
        start +
        "-" +
        this.index +
        " [" +
        this.text.substring(start, end) +
        "]"
      : " " + end;
    throw $parseMinErr(
      "lexerr",
      "Lexer Error: {0} at column{1} in expression [{2}].",
      error,
      colStr,
      this.text
    );
  },

  readNumber: function () {
    var number = "";
    var start = this.index;
    while (this.index < this.text.length) {
      var ch = lowercase(this.text.charAt(this.index));
      if (ch === "." || this.isNumber(ch)) {
        number += ch;
      } else {
        var peekCh = this.peek();
        if (ch === "e" && this.isExpOperator(peekCh)) {
          number += ch;
        } else if (
          this.isExpOperator(ch) &&
          peekCh &&
          this.isNumber(peekCh) &&
          number.charAt(number.length - 1) === "e"
        ) {
          number += ch;
        } else if (
          this.isExpOperator(ch) &&
          (!peekCh || !this.isNumber(peekCh)) &&
          number.charAt(number.length - 1) === "e"
        ) {
          this.throwError("Invalid exponent");
        } else {
          break;
        }
      }
      this.index++;
    }
    this.tokens.push({
      index: start,
      text: number,
      constant: true,
      value: Number(number),
    });
  },

  readIdent: function () {
    var start = this.index;
    this.index += this.peekMultichar().length;
    while (this.index < this.text.length) {
      var ch = this.peekMultichar();
      if (!this.isIdentifierContinue(ch)) {
        break;
      }
      this.index += ch.length;
    }
    this.tokens.push({
      index: start,
      text: this.text.slice(start, this.index),
      identifier: true,
    });
  },

  readString: function (quote) {
    var start = this.index;
    this.index++;
    var string = "";
    var rawString = quote;
    var escape = false;
    while (this.index < this.text.length) {
      var ch = this.text.charAt(this.index);
      rawString += ch;
      if (escape) {
        if (ch === "u") {
          var hex = this.text.substring(this.index + 1, this.index + 5);
          if (!hex.match(/[\da-f]{4}/i)) {
            this.throwError("Invalid unicode escape [\\u" + hex + "]");
          }
          this.index += 4;
          string += String.fromCharCode(parseInt(hex, 16));
        } else {
          var rep = ESCAPE[ch];
          string = string + (rep || ch);
        }
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === quote) {
        this.index++;
        this.tokens.push({
          index: start,
          text: rawString,
          constant: true,
          value: string,
        });
        return;
      } else {
        string += ch;
      }
      this.index++;
    }
    this.throwError("Unterminated quote", start);
  },
};

function AST(lexer, options) {
  this.lexer = lexer;
  this.options = options;
};

AST.Program = "Program";
AST.ExpressionStatement = "ExpressionStatement";
AST.AssignmentExpression = "AssignmentExpression";
AST.ConditionalExpression = "ConditionalExpression";
AST.LogicalExpression = "LogicalExpression";
AST.BinaryExpression = "BinaryExpression";
AST.UnaryExpression = "UnaryExpression";
AST.CallExpression = "CallExpression";
AST.MemberExpression = "MemberExpression";
AST.Identifier = "Identifier";
AST.Literal = "Literal";
AST.ArrayExpression = "ArrayExpression";
AST.Property = "Property";
AST.ObjectExpression = "ObjectExpression";
AST.ThisExpression = "ThisExpression";
AST.LocalsExpression = "LocalsExpression";

// Internal use only
AST.NGValueParameter = "NGValueParameter";

AST.prototype = {
  ast: function (text) {
    this.text = text;
    this.tokens = this.lexer.lex(text);

    var value = this.program();

    if (this.tokens.length !== 0) {
      this.throwError("is an unexpected token", this.tokens[0]);
    }

    return value;
  },

  program: function () {
    var body = [];
    while (true) {
      if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]"))
        body.push(this.expressionStatement());
      if (!this.expect(";")) {
        return { type: AST.Program, body: body };
      }
    }
  },

  expressionStatement: function () {
    return { type: AST.ExpressionStatement, expression: this.filterChain() };
  },

  filterChain: function () {
    var left = this.expression();
    while (this.expect("|")) {
      left = this.filter(left);
    }
    return left;
  },

  expression: function () {
    return this.assignment();
  },

  assignment: function () {
    var result = this.ternary();
    if (this.expect("=")) {
      if (!isAssignable(result)) {
        throw $parseMinErr("lval", "Trying to assign a value to a non l-value");
      }

      result = {
        type: AST.AssignmentExpression,
        left: result,
        right: this.assignment(),
        operator: "=",
      };
    }
    return result;
  },

  ternary: function () {
    var test = this.logicalOR();
    var alternate;
    var consequent;
    if (this.expect("?")) {
      alternate = this.expression();
      if (this.consume(":")) {
        consequent = this.expression();
        return {
          type: AST.ConditionalExpression,
          test: test,
          alternate: alternate,
          consequent: consequent,
        };
      }
    }
    return test;
  },

  logicalOR: function () {
    var left = this.logicalAND();
    while (this.expect("||")) {
      left = {
        type: AST.LogicalExpression,
        operator: "||",
        left: left,
        right: this.logicalAND(),
      };
    }
    return left;
  },

  logicalAND: function () {
    var left = this.equality();
    while (this.expect("&&")) {
      left = {
        type: AST.LogicalExpression,
        operator: "&&",
        left: left,
        right: this.equality(),
      };
    }
    return left;
  },

  equality: function () {
    var left = this.relational();
    var token;
    while ((token = this.expect("==", "!=", "===", "!=="))) {
      left = {
        type: AST.BinaryExpression,
        operator: token.text,
        left: left,
        right: this.relational(),
      };
    }
    return left;
  },

  relational: function () {
    var left = this.additive();
    var token;
    while ((token = this.expect("<", ">", "<=", ">="))) {
      left = {
        type: AST.BinaryExpression,
        operator: token.text,
        left: left,
        right: this.additive(),
      };
    }
    return left;
  },

  additive: function () {
    var left = this.multiplicative();
    var token;
    while ((token = this.expect("+", "-"))) {
      left = {
        type: AST.BinaryExpression,
        operator: token.text,
        left: left,
        right: this.multiplicative(),
      };
    }
    return left;
  },

  multiplicative: function () {
    var left = this.unary();
    var token;
    while ((token = this.expect("*", "/", "%"))) {
      left = {
        type: AST.BinaryExpression,
        operator: token.text,
        left: left,
        right: this.unary(),
      };
    }
    return left;
  },

  unary: function () {
    var token;
    if ((token = this.expect("+", "-", "!"))) {
      return {
        type: AST.UnaryExpression,
        operator: token.text,
        prefix: true,
        argument: this.unary(),
      };
    } else {
      return this.primary();
    }
  },

  primary: function () {
    var primary;
    if (this.expect("(")) {
      primary = this.filterChain();
      this.consume(")");
    } else if (this.expect("[")) {
      primary = this.arrayDeclaration();
    } else if (this.expect("{")) {
      primary = this.object();
    } else if (this.selfReferential.hasOwnProperty(this.peek().text)) {
      primary = copy(this.selfReferential[this.consume().text]);
    } else if (this.options.literals.hasOwnProperty(this.peek().text)) {
      primary = {
        type: AST.Literal,
        value: this.options.literals[this.consume().text],
      };
    } else if (this.peek().identifier) {
      primary = this.identifier();
    } else if (this.peek().constant) {
      primary = this.constant();
    } else {
      this.throwError("not a primary expression", this.peek());
    }

    var next;
    while ((next = this.expect("(", "[", "."))) {
      if (next.text === "(") {
        primary = {
          type: AST.CallExpression,
          callee: primary,
          arguments: this.parseArguments(),
        };
        this.consume(")");
      } else if (next.text === "[") {
        primary = {
          type: AST.MemberExpression,
          object: primary,
          property: this.expression(),
          computed: true,
        };
        this.consume("]");
      } else if (next.text === ".") {
        primary = {
          type: AST.MemberExpression,
          object: primary,
          property: this.identifier(),
          computed: false,
        };
      } else {
        this.throwError("IMPOSSIBLE");
      }
    }
    return primary;
  },

  filter: function (baseExpression) {
    var args = [baseExpression];
    var result = {
      type: AST.CallExpression,
      callee: this.identifier(),
      arguments: args,
      filter: true,
    };

    while (this.expect(":")) {
      args.push(this.expression());
    }

    return result;
  },

  parseArguments: function () {
    var args = [];
    if (this.peekToken().text !== ")") {
      do {
        args.push(this.filterChain());
      } while (this.expect(","));
    }
    return args;
  },

  identifier: function () {
    var token = this.consume();
    if (!token.identifier) {
      this.throwError("is not a valid identifier", token);
    }
    return { type: AST.Identifier, name: token.text };
  },

  constant: function () {
    // TODO check that it is a constant
    return { type: AST.Literal, value: this.consume().value };
  },

  arrayDeclaration: function () {
    var elements = [];
    if (this.peekToken().text !== "]") {
      do {
        if (this.peek("]")) {
          // Support trailing commas per ES5.1.
          break;
        }
        elements.push(this.expression());
      } while (this.expect(","));
    }
    this.consume("]");

    return { type: AST.ArrayExpression, elements: elements };
  },

  object: function () {
    var properties = [],
      property;
    if (this.peekToken().text !== "}") {
      do {
        if (this.peek("}")) {
          // Support trailing commas per ES5.1.
          break;
        }
        property = { type: AST.Property, kind: "init" };
        if (this.peek().constant) {
          property.key = this.constant();
          property.computed = false;
          this.consume(":");
          property.value = this.expression();
        } else if (this.peek().identifier) {
          property.key = this.identifier();
          property.computed = false;
          if (this.peek(":")) {
            this.consume(":");
            property.value = this.expression();
          } else {
            property.value = property.key;
          }
        } else if (this.peek("[")) {
          this.consume("[");
          property.key = this.expression();
          this.consume("]");
          property.computed = true;
          this.consume(":");
          property.value = this.expression();
        } else {
          this.throwError("invalid key", this.peek());
        }
        properties.push(property);
      } while (this.expect(","));
    }
    this.consume("}");

    return { type: AST.ObjectExpression, properties: properties };
  },

  throwError: function (msg, token) {
    throw $parseMinErr(
      "syntax",
      "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].",
      token.text,
      msg,
      token.index + 1,
      this.text,
      this.text.substring(token.index)
    );
  },

  consume: function (e1) {
    if (this.tokens.length === 0) {
      throw $parseMinErr(
        "ueoe",
        "Unexpected end of expression: {0}",
        this.text
      );
    }

    var token = this.expect(e1);
    if (!token) {
      this.throwError("is unexpected, expecting [" + e1 + "]", this.peek());
    }
    return token;
  },

  peekToken: function () {
    if (this.tokens.length === 0) {
      throw $parseMinErr(
        "ueoe",
        "Unexpected end of expression: {0}",
        this.text
      );
    }
    return this.tokens[0];
  },

  peek: function (e1, e2, e3, e4) {
    return this.peekAhead(0, e1, e2, e3, e4);
  },

  peekAhead: function (i, e1, e2, e3, e4) {
    if (this.tokens.length > i) {
      var token = this.tokens[i];
      var t = token.text;
      if (
        t === e1 ||
        t === e2 ||
        t === e3 ||
        t === e4 ||
        (!e1 && !e2 && !e3 && !e4)
      ) {
        return token;
      }
    }
    return false;
  },

  expect: function (e1, e2, e3, e4) {
    var token = this.peek(e1, e2, e3, e4);
    if (token) {
      this.tokens.shift();
      return token;
    }
    return false;
  },

  selfReferential: {
    this: { type: AST.ThisExpression },
    $locals: { type: AST.LocalsExpression },
  },
};

function ifDefined(v, d) {
  return typeof v !== "undefined" ? v : d;
}

function plusFn(l, r) {
  if (typeof l === "undefined") return r;
  if (typeof r === "undefined") return l;
  return l + r;
}

function isStateless($filter, filterName) {
  var fn = $filter(filterName);
  return !fn.$stateful;
}

function findConstantAndWatchExpressions(ast, $filter) {
  var allConstants;
  var argsToWatch;
  var isStatelessFilter;
  switch (ast.type) {
    case AST.Program:
      allConstants = true;
      forEach(ast.body, function (expr) {
        findConstantAndWatchExpressions(expr.expression, $filter);
        allConstants = allConstants && expr.expression.constant;
      });
      ast.constant = allConstants;
      break;
    case AST.Literal:
      ast.constant = true;
      ast.toWatch = [];
      break;
    case AST.UnaryExpression:
      findConstantAndWatchExpressions(ast.argument, $filter);
      ast.constant = ast.argument.constant;
      ast.toWatch = ast.argument.toWatch;
      break;
    case AST.BinaryExpression:
      findConstantAndWatchExpressions(ast.left, $filter);
      findConstantAndWatchExpressions(ast.right, $filter);
      ast.constant = ast.left.constant && ast.right.constant;
      ast.toWatch = ast.left.toWatch.concat(ast.right.toWatch);
      break;
    case AST.LogicalExpression:
      findConstantAndWatchExpressions(ast.left, $filter);
      findConstantAndWatchExpressions(ast.right, $filter);
      ast.constant = ast.left.constant && ast.right.constant;
      ast.toWatch = ast.constant ? [] : [ast];
      break;
    case AST.ConditionalExpression:
      findConstantAndWatchExpressions(ast.test, $filter);
      findConstantAndWatchExpressions(ast.alternate, $filter);
      findConstantAndWatchExpressions(ast.consequent, $filter);
      ast.constant =
        ast.test.constant && ast.alternate.constant && ast.consequent.constant;
      ast.toWatch = ast.constant ? [] : [ast];
      break;
    case AST.Identifier:
      ast.constant = false;
      ast.toWatch = [ast];
      break;
    case AST.MemberExpression:
      findConstantAndWatchExpressions(ast.object, $filter);
      if (ast.computed) {
        findConstantAndWatchExpressions(ast.property, $filter);
      }
      ast.constant =
        ast.object.constant && (!ast.computed || ast.property.constant);
      ast.toWatch = [ast];
      break;
    case AST.CallExpression:
      isStatelessFilter = ast.filter
        ? isStateless($filter, ast.callee.name)
        : false;
      allConstants = isStatelessFilter;
      argsToWatch = [];
      forEach(ast.arguments, function (expr) {
        findConstantAndWatchExpressions(expr, $filter);
        allConstants = allConstants && expr.constant;
        if (!expr.constant) {
          argsToWatch.push.apply(argsToWatch, expr.toWatch);
        }
      });
      ast.constant = allConstants;
      ast.toWatch = isStatelessFilter ? argsToWatch : [ast];
      break;
    case AST.AssignmentExpression:
      findConstantAndWatchExpressions(ast.left, $filter);
      findConstantAndWatchExpressions(ast.right, $filter);
      ast.constant = ast.left.constant && ast.right.constant;
      ast.toWatch = [ast];
      break;
    case AST.ArrayExpression:
      allConstants = true;
      argsToWatch = [];
      forEach(ast.elements, function (expr) {
        findConstantAndWatchExpressions(expr, $filter);
        allConstants = allConstants && expr.constant;
        if (!expr.constant) {
          argsToWatch.push.apply(argsToWatch, expr.toWatch);
        }
      });
      ast.constant = allConstants;
      ast.toWatch = argsToWatch;
      break;
    case AST.ObjectExpression:
      allConstants = true;
      argsToWatch = [];
      forEach(ast.properties, function (property) {
        findConstantAndWatchExpressions(property.value, $filter);
        allConstants =
          allConstants && property.value.constant && !property.computed;
        if (!property.value.constant) {
          argsToWatch.push.apply(argsToWatch, property.value.toWatch);
        }
      });
      ast.constant = allConstants;
      ast.toWatch = argsToWatch;
      break;
    case AST.ThisExpression:
      ast.constant = false;
      ast.toWatch = [];
      break;
    case AST.LocalsExpression:
      ast.constant = false;
      ast.toWatch = [];
      break;
  }
}

function getInputs(body) {
  if (body.length !== 1) return;
  var lastExpression = body[0].expression;
  var candidate = lastExpression.toWatch;
  if (candidate.length !== 1) return candidate;
  return candidate[0] !== lastExpression ? candidate : undefined;
}

function isAssignable(ast) {
  return ast.type === AST.Identifier || ast.type === AST.MemberExpression;
}

function assignableAST(ast) {
  if (ast.body.length === 1 && isAssignable(ast.body[0].expression)) {
    return {
      type: AST.AssignmentExpression,
      left: ast.body[0].expression,
      right: { type: AST.NGValueParameter },
      operator: "=",
    };
  }
}

function isLiteral(ast) {
  return (
    ast.body.length === 0 ||
    (ast.body.length === 1 &&
      (ast.body[0].expression.type === AST.Literal ||
        ast.body[0].expression.type === AST.ArrayExpression ||
        ast.body[0].expression.type === AST.ObjectExpression))
  );
}

function isConstant(ast) {
  return ast.constant;
}

function ASTCompiler(astBuilder, $filter) {
  this.astBuilder = astBuilder;
  this.$filter = $filter;
}

ASTCompiler.prototype = {
  compile: function (expression) {
    var self = this;
    var ast = this.astBuilder.ast(expression);
    this.state = {
      nextId: 0,
      filters: {},
      fn: { vars: [], body: [], own: {} },
      assign: { vars: [], body: [], own: {} },
      inputs: [],
    };
    findConstantAndWatchExpressions(ast, self.$filter);
    var extra = "";
    var assignable;
    this.stage = "assign";
    if ((assignable = assignableAST(ast))) {
      this.state.computing = "assign";
      var result = this.nextId();
      this.recurse(assignable, result);
      this.return_(result);
      extra = "fn.assign=" + this.generateFunction("assign", "s,v,l");
    }
    var toWatch = getInputs(ast.body);
    self.stage = "inputs";
    forEach(toWatch, function (watch, key) {
      var fnKey = "fn" + key;
      self.state[fnKey] = { vars: [], body: [], own: {} };
      self.state.computing = fnKey;
      var intoId = self.nextId();
      self.recurse(watch, intoId);
      self.return_(intoId);
      self.state.inputs.push(fnKey);
      watch.watchId = key;
    });
    this.state.computing = "fn";
    this.stage = "main";
    this.recurse(ast);
    var fnString =
      // The build and minification steps remove the string "use strict" from the code, but this is done using a regex.
      // This is a workaround for this until we do a better job at only removing the prefix only when we should.
      '"' +
      this.USE +
      " " +
      this.STRICT +
      '";\n' +
      this.filterPrefix() +
      "var fn=" +
      this.generateFunction("fn", "s,l,a,i") +
      extra +
      this.watchFns() +
      "return fn;";
    // eslint-disable-next-line no-new-func
    var fn = new Function(
      "$filter",
      "getStringValue",
      "ifDefined",
      "plus",
      fnString
    )(this.$filter, getStringValue, ifDefined, plusFn);

    this.state = this.stage = undefined;
    fn.ast = ast;
    fn.literal = isLiteral(ast);
    fn.constant = isConstant(ast);
    return fn;
  },

  USE: "use",

  STRICT: "strict",

  watchFns: function () {
    var result = [];
    var fns = this.state.inputs;
    var self = this;
    forEach(fns, function (name) {
      result.push("var " + name + "=" + self.generateFunction(name, "s"));
    });
    if (fns.length) {
      result.push("fn.inputs=[" + fns.join(",") + "];");
    }
    return result.join("");
  },

  generateFunction: function (name, params) {
    return (
      "function(" +
      params +
      "){" +
      this.varsPrefix(name) +
      this.body(name) +
      "};"
    );
  },

  filterPrefix: function () {
    var parts = [];
    var self = this;
    forEach(this.state.filters, function (id, filter) {
      parts.push(id + "=$filter(" + self.escape(filter) + ")");
    });
    if (parts.length) return "var " + parts.join(",") + ";";
    return "";
  },

  varsPrefix: function (section) {
    return this.state[section].vars.length
      ? "var " + this.state[section].vars.join(",") + ";"
      : "";
  },

  body: function (section) {
    return this.state[section].body.join("");
  },

  recurse: function (
    ast,
    intoId,
    nameId,
    recursionFn,
    create,
    skipWatchIdCheck
  ) {
    var left,
      right,
      self = this,
      args,
      expression,
      computed;
    recursionFn = recursionFn || noop;
    if (!skipWatchIdCheck && isDefined(ast.watchId)) {
      intoId = intoId || this.nextId();
      this.if_(
        "i",
        this.lazyAssign(intoId, this.unsafeComputedMember("i", ast.watchId)),
        this.lazyRecurse(ast, intoId, nameId, recursionFn, create, true)
      );
      return;
    }

    switch (ast.type) {
      case AST.Program:
        forEach(ast.body, function (expression, pos) {
          self.recurse(
            expression.expression,
            undefined,
            undefined,
            function (expr) {
              right = expr;
            }
          );
          if (pos !== ast.body.length - 1) {
            self.current().body.push(right, ";");
          } else {
            self.return_(right);
          }
        });
        break;
      case AST.Literal:
        expression = this.escape(ast.value);
        this.assign(intoId, expression);
        recursionFn(intoId || expression);
        break;
      case AST.UnaryExpression:
        this.recurse(ast.argument, undefined, undefined, function (expr) {
          right = expr;
        });
        expression = ast.operator + "(" + this.ifDefined(right, 0) + ")";
        this.assign(intoId, expression);
        recursionFn(expression);
        break;
      case AST.BinaryExpression:
        this.recurse(ast.left, undefined, undefined, function (expr) {
          left = expr;
        });
        this.recurse(ast.right, undefined, undefined, function (expr) {
          right = expr;
        });
        if (ast.operator === "+") {
          expression = this.plus(left, right);
        } else if (ast.operator === "-") {
          expression =
            this.ifDefined(left, 0) + ast.operator + this.ifDefined(right, 0);
        } else {
          expression = "(" + left + ")" + ast.operator + "(" + right + ")";
        }
        this.assign(intoId, expression);
        recursionFn(expression);
        break;
      case AST.LogicalExpression:
        intoId = intoId || this.nextId();
        self.recurse(ast.left, intoId);
        self.if_(
          ast.operator === "&&" ? intoId : self.not(intoId),
          self.lazyRecurse(ast.right, intoId)
        );
        recursionFn(intoId);
        break;
      case AST.ConditionalExpression:
        intoId = intoId || this.nextId();
        self.recurse(ast.test, intoId);
        self.if_(
          intoId,
          self.lazyRecurse(ast.alternate, intoId),
          self.lazyRecurse(ast.consequent, intoId)
        );
        recursionFn(intoId);
        break;
      case AST.Identifier:
        intoId = intoId || this.nextId();
        if (nameId) {
          nameId.context =
            self.stage === "inputs"
              ? "s"
              : this.assign(
                  this.nextId(),
                  this.getHasOwnProperty("l", ast.name) + "?l:s"
                );
          nameId.computed = false;
          nameId.name = ast.name;
        }
        self.if_(
          self.stage === "inputs" ||
            self.not(self.getHasOwnProperty("l", ast.name)),
          function () {
            self.if_(
              self.stage === "inputs" ||
                self.and_(
                  "s",
                  self.or_(
                    self.isNull(self.nonComputedMember("s", ast.name)),
                    self.has_("s", ast.name)
                  )
                ),
              function () {
                if (create && create !== 1) {
                  self.if_(
                    self.isNull(self.nonComputedMember("s", ast.name)),
                    self.lazyAssign(self.nonComputedMember("s", ast.name), "{}")
                  );
                }
                self.assign(intoId, self.nonComputedMember("s", ast.name));
              }
            );
          },
          intoId &&
            self.lazyAssign(intoId, self.nonComputedMember("l", ast.name))
        );
        recursionFn(intoId);
        break;
      case AST.MemberExpression:
        left = (nameId && (nameId.context = this.nextId())) || this.nextId();
        intoId = intoId || this.nextId();
        self.recurse(
          ast.object,
          left,
          undefined,
          function () {
            var member = null;
            var inAssignment = self.current().inAssignment;
            if (ast.computed) {
              right = self.nextId();
              if (inAssignment || self.state.computing === "assign") {
                member = self.unsafeComputedMember(left, right);
              } else {
                member = self.computedMember(left, right);
              }
            } else {
              if (inAssignment || self.state.computing === "assign") {
                member = self.unsafeNonComputedMember(left, ast.property.name);
              } else {
                member = self.nonComputedMember(left, ast.property.name);
              }
              right = ast.property.name;
            }

            if (ast.computed) {
              if (ast.property.type === AST.Literal) {
                self.recurse(ast.property, right);
              }
            }
            self.if_(
              self.and_(
                self.notNull(left),
                self.or_(
                  self.isNull(member),
                  self.has_(left, right, ast.computed)
                )
              ),
              function () {
                if (ast.computed) {
                  if (ast.property.type !== AST.Literal) {
                    self.recurse(ast.property, right);
                  }
                  if (create && create !== 1) {
                    self.if_(self.not(member), self.lazyAssign(member, "{}"));
                  }
                  self.assign(intoId, member);
                  if (nameId) {
                    nameId.computed = true;
                    nameId.name = right;
                  }
                } else {
                  if (create && create !== 1) {
                    self.if_(
                      self.isNull(member),
                      self.lazyAssign(member, "{}")
                    );
                  }
                  self.assign(intoId, member);
                  if (nameId) {
                    nameId.computed = false;
                    nameId.name = ast.property.name;
                  }
                }
              },
              function () {
                self.assign(intoId, "undefined");
              }
            );
            recursionFn(intoId);
          },
          !!create
        );
        break;
      case AST.CallExpression:
        intoId = intoId || this.nextId();
        if (ast.filter) {
          right = self.filter(ast.callee.name);
          args = [];
          forEach(ast.arguments, function (expr) {
            var argument = self.nextId();
            self.recurse(expr, argument);
            args.push(argument);
          });
          expression = right + ".call(" + right + "," + args.join(",") + ")";
          self.assign(intoId, expression);
          recursionFn(intoId);
        } else {
          right = self.nextId();
          left = {};
          args = [];
          self.recurse(ast.callee, right, left, function () {
            self.if_(
              self.notNull(right),
              function () {
                forEach(ast.arguments, function (expr) {
                  self.recurse(
                    expr,
                    ast.constant ? undefined : self.nextId(),
                    undefined,
                    function (argument) {
                      args.push(argument);
                    }
                  );
                });
                if (left.name) {
                  var x = self.member(left.context, left.name, left.computed);
                  expression =
                    "(" +
                    x +
                    " === null ? null : " +
                    self.unsafeMember(left.context, left.name, left.computed) +
                    ".call(" +
                    [left.context].concat(args).join(",") +
                    "))";
                } else {
                  expression = right + "(" + args.join(",") + ")";
                }
                self.assign(intoId, expression);
              },
              function () {
                self.assign(intoId, "undefined");
              }
            );
            recursionFn(intoId);
          });
        }
        break;
      case AST.AssignmentExpression:
        right = this.nextId();
        left = {};
        self.current().inAssignment = true;
        this.recurse(
          ast.left,
          undefined,
          left,
          function () {
            self.if_(
              self.and_(
                self.notNull(left.context),
                self.or_(
                  self.has_(left.context, left.name),
                  self.isNull(
                    self.member(left.context, left.name, left.computed)
                  )
                )
              ),
              function () {
                self.recurse(ast.right, right);
                expression =
                  self.member(left.context, left.name, left.computed) +
                  ast.operator +
                  right;
                self.assign(intoId, expression);
                recursionFn(intoId || expression);
              }
            );
            self.current().inAssignment = false;
            self.recurse(ast.right, right);
            self.current().inAssignment = true;
          },
          1
        );
        self.current().inAssignment = false;
        break;
      case AST.ArrayExpression:
        args = [];
        forEach(ast.elements, function (expr) {
          self.recurse(
            expr,
            ast.constant ? undefined : self.nextId(),
            undefined,
            function (argument) {
              args.push(argument);
            }
          );
        });
        expression = "[" + args.join(",") + "]";
        this.assign(intoId, expression);
        recursionFn(intoId || expression);
        break;
      case AST.ObjectExpression:
        args = [];
        computed = false;
        forEach(ast.properties, function (property) {
          if (property.computed) {
            computed = true;
          }
        });
        if (computed) {
          intoId = intoId || this.nextId();
          this.assign(intoId, "{}");
          forEach(ast.properties, function (property) {
            if (property.computed) {
              left = self.nextId();
              self.recurse(property.key, left);
            } else {
              left =
                property.key.type === AST.Identifier
                  ? property.key.name
                  : "" + property.key.value;
            }
            right = self.nextId();
            self.recurse(property.value, right);
            self.assign(
              self.unsafeMember(intoId, left, property.computed),
              right
            );
          });
        } else {
          forEach(ast.properties, function (property) {
            self.recurse(
              property.value,
              ast.constant ? undefined : self.nextId(),
              undefined,
              function (expr) {
                args.push(
                  self.escape(
                    property.key.type === AST.Identifier
                      ? property.key.name
                      : "" + property.key.value
                  ) +
                    ":" +
                    expr
                );
              }
            );
          });
          expression = "{" + args.join(",") + "}";
          this.assign(intoId, expression);
        }
        recursionFn(intoId || expression);
        break;
      case AST.ThisExpression:
        this.assign(intoId, "s");
        recursionFn(intoId || "s");
        break;
      case AST.LocalsExpression:
        this.assign(intoId, "l");
        recursionFn(intoId || "l");
        break;
      case AST.NGValueParameter:
        this.assign(intoId, "v");
        recursionFn(intoId || "v");
        break;
    }
  },

  getHasOwnProperty: function (element, property) {
    var key = element + "." + property;
    var own = this.current().own;
    if (!own.hasOwnProperty(key)) {
      own[key] = this.nextId(
        false,
        element + "&&(" + this.escape(property) + " in " + element + ")"
      );
    }
    return own[key];
  },

  assign: function (id, value) {
    if (!id) return;
    this.current().body.push(id, "=", value, ";");
    return id;
  },

  filter: function (filterName) {
    if (!this.state.filters.hasOwnProperty(filterName)) {
      this.state.filters[filterName] = this.nextId(true);
    }
    return this.state.filters[filterName];
  },

  ifDefined: function (id, defaultValue) {
    return "ifDefined(" + id + "," + this.escape(defaultValue) + ")";
  },

  plus: function (left, right) {
    return "plus(" + left + "," + right + ")";
  },

  return_: function (id) {
    this.current().body.push("return ", id, ";");
  },

  if_: function (test, alternate, consequent) {
    if (test === true) {
      alternate();
    } else {
      var body = this.current().body;
      body.push("if(", test, "){");
      alternate();
      body.push("}");
      if (consequent) {
        body.push("else{");
        consequent();
        body.push("}");
      }
    }
  },
  or_: function (expr1, expr2) {
    return "(" + expr1 + ") || (" + expr2 + ")";
  },
  // hasOwnProperty_: function (obj, prop, computed) {
  //   if (computed) {
  //     return "(Object.prototype.hasOwnProperty.call(" + obj + "," + prop + "))";
  //   } else {
  //     return (
  //       "(Object.prototype.hasOwnProperty.call(" + obj + ",'" + prop + "'))"
  //     );
  //   }
  // },
  hasProperty_: function(obj, prop, computed) {
    if (computed) {
      return "(" + prop + " in " + obj + ")";
    } else {
      return "('" + prop + "' in " + obj + ")";
    }
  },
  has_: function(obj, prop, computed) {
    // return this.hasOwnProperty_(obj, prop, computed)

    // here is what I changed in fork
    // in original library, the pareser can only parse properties which is own properties, this make it impossible to read from prototype
    // so I changed it
    return this.hasProperty_(obj, prop, computed)
  },
  and_: function (expr1, expr2) {
    return "(" + expr1 + ") && (" + expr2 + ")";
  },
  not: function (expression) {
    return "!(" + expression + ")";
  },

  isNull: function (expression) {
    return expression + "==null";
  },

  notNull: function (expression) {
    return expression + "!=null";
  },

  nonComputedMember: function (left, right) {
    var SAFE_IDENTIFIER = /^[$_a-zA-Z][$_a-zA-Z0-9]*$/;
    var UNSAFE_CHARACTERS = /[^$_a-zA-Z0-9]/g;
    var expr = "";
    if (SAFE_IDENTIFIER.test(right)) {
      expr = left + "." + right;
    } else {
      right = right.replace(UNSAFE_CHARACTERS, this.stringEscapeFn);
      expr = left + '["' + right + '"]';
    }

    return expr;
  },

  unsafeComputedMember: function (left, right) {
    return left + "[" + right + "]";
  },
  unsafeNonComputedMember: function (left, right) {
    return this.nonComputedMember(left, right);
  },

  computedMember: function (left, right) {
    if (this.state.computing === "assign") {
      return this.unsafeComputedMember(left, right);
    }
    // return left + "[" + right + "]";
    return (
      "(" +
      left +
      ".hasOwnProperty(" +
      right +
      ") ? " +
      left +
      "[" +
      right +
      "] : null)"
    );
  },

  unsafeMember: function (left, right, computed) {
    if (computed) return this.unsafeComputedMember(left, right);
    return this.unsafeNonComputedMember(left, right);
  },

  member: function (left, right, computed) {
    if (computed) return this.computedMember(left, right);
    return this.nonComputedMember(left, right);
  },

  getStringValue: function (item) {
    this.assign(item, "getStringValue(" + item + ")");
  },

  lazyRecurse: function (
    ast,
    intoId,
    nameId,
    recursionFn,
    create,
    skipWatchIdCheck
  ) {
    var self = this;
    return function () {
      self.recurse(ast, intoId, nameId, recursionFn, create, skipWatchIdCheck);
    };
  },

  lazyAssign: function (id, value) {
    var self = this;
    return function () {
      self.assign(id, value);
    };
  },

  stringEscapeRegex: /[^ a-zA-Z0-9]/g,

  stringEscapeFn: function (c) {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  },

  escape: function (value) {
    if (isString(value))
      return (
        "'" + value.replace(this.stringEscapeRegex, this.stringEscapeFn) + "'"
      );
    if (isNumber(value)) return value.toString();
    if (value === true) return "true";
    if (value === false) return "false";
    if (value === null) return "null";
    if (typeof value === "undefined") return "undefined";

    throw $parseMinErr("esc", "IMPOSSIBLE");
  },

  nextId: function (skip, init) {
    var id = "v" + this.state.nextId++;
    if (!skip) {
      this.current().vars.push(id + (init ? "=" + init : ""));
    }
    return id;
  },

  current: function () {
    return this.state[this.state.computing];
  },
};

/**
 * @constructor
 */
function Parser(lexer, $filter, options) {
  this.lexer = lexer;
  this.$filter = $filter;
  this.options = options;
  this.ast = new AST(lexer, options);
  this.astCompiler = new ASTCompiler(this.ast, $filter);
};

Parser.prototype = {
  constructor: Parser,

  parse: function (text) {
    return this.astCompiler.compile(text);
  },
};

///////////////////////////////////

/**
 * @ngdoc service
 * @name $parse
 * @kind function
 *
 * @description
 *
 * Converts Angular {@link guide/expression expression} into a function.
 *
 * ```js
 *   var getter = $parse('user.name');
 *   var setter = getter.assign;
 *   var context = {user:{name:'angular'}};
 *   var locals = {user:{name:'local'}};
 *
 *   expect(getter(context)).toEqual('angular');
 *   setter(context, 'newValue');
 *   expect(context.user.name).toEqual('newValue');
 *   expect(getter(context, locals)).toEqual('local');
 * ```
 *
 *
 * @param {string} expression String expression to compile.
 * @returns {function(context, locals)} a function which represents the compiled expression:
 *
 *    * `context` – `{object}` – an object against which any expressions embedded in the strings
 *      are evaluated against (typically a scope object).
 *    * `locals` – `{object=}` – local variables context object, useful for overriding values in
 *      `context`.
 *
 *    The returned function also has the following properties:
 *      * `literal` – `{boolean}` – whether the expression's top-level node is a JavaScript
 *        literal.
 *      * `constant` – `{boolean}` – whether the expression is made entirely of JavaScript
 *        constant literals.
 *      * `assign` – `{?function(context, value)}` – if the expression is assignable, this will be
 *        set to a function to change its value on the given context.
 *
 */


/**
 *
 * @param {object} data
 * @param {object} options
 */
function ScopeX(data, options) {
  var parserOptions = {
      expensiveChecks: true,
      literals: {
          true: true,
          false: false,
          null: null,
          /*eslint no-undefined: 0*/
          undefined: undefined
          /* eslint: no-undefined: 1  */
      }
  };

  var filters = options && options.filters ? assign({}, options.filters) : {};

  var lexer = new Lexer({});
  var parser = new Parser(lexer, function getFilter(name) {
      return filters[name];
  }, parserOptions);
  var caches = {};

  /**
   * Compiles src and returns a function that executes src on a target object.
   * The compiled function is cached under caches[src] to speed up further calls.
   *
   * @param {string} src
   * @returns {function}
   */
  function compile(src) {
      var cached;

      if (typeof src !== 'string') {
          throw new TypeError('ScopeX need a string, but saw ' + typeof src);
      }

      cached = caches[src];
      if (!cached) {
          cached = caches[src] = parser.parse(src);
      }

      return cached;
  }

  this.options = options;
  this.filters = filters;
  this.compile = compile;
  this.data = data ? data : {};
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
  locals = locals || {};
  var data = isAbsObject(locals) ? setPrototypeOf(locals, this.data) : assign({}, locals);
  var scopex = new ScopeX(data, this.options);
  assign(scopex.filters, this.filters);
  return scopex;
};

function isAbsObject(value) {
  return value && typeof value === 'object' && value.constructor === Object
}

function hasOwnKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function assign(a, b) {
  for (var i in b) {
    if (hasOwnKey(b, i)) {
      a[i] = b[i];
    }
  }
  return a;
}

function setPrototypeOf(obj, proto) {
  if (Object.setPrototypeOf) {
    Object.setPrototypeOf(obj, proto);
  }
  else {
    obj.__proto__ = proto;
  }
  return obj
}

function uniqueArray(items) {
  return items.reduce(function(res, key) {
    if (res.indexOf(key) > -1) {
      return res;
    }
    res.push(key);
    return res;
  }, []);
}

ScopeX.createScope = createScope;

/**
 * @param {object} scopeVars
 * @param {object[]|string[]} chain
 * @returns new ScopeX()
 */
function createScope(scopeVars, options) {
  options = options || {};
  var chain = options.chain;
  var opts = assign({}, options);
  delete opts.chain;

  function ensureValue(value, target) {
    if (value && typeof value === 'function') {
      return value.bind(target);
    }
    return value;
  }

  var data = null;

  var deps = [];
  var collecting = false;

  function inheritFrom(child, parent) {
    return new Proxy({}, {
      get: function(_, key) {
        var keyInChild = key in child;
        var keyInParent = key in parent;
        if (collecting && (keyInChild || keyInParent)) {
          deps.push(key);
        }
        if (keyInChild) {
          return ensureValue(child[key], child);
        }
        if (keyInParent) {
          return ensureValue(parent[key], parent);
        }
      },
      set: function(_, key, value) {
        if (key in child) {
          child[key] = value;
        }
        else if (key in parent) {
          parent[key] = value;
        }
        else {
          child[key] = value;
        }
        return true;
      },
      deleteProperty: function() {
        return false;
      },
      has: function(_, key) {
        if (key in child) {
          return true;
        }
        if (key in parent) {
          return true;
        }
        return false;
      },
      ownKeys: function() {
        var keys = [];
        for (var key in child) {
          keys.push(key);
        }
        for (key in parent) {
          if (keys.indexOf(key) > -1) {
            continue;
          }
          keys.push(key);
        }
        return keys;
      },
      getOwnPropertyDescriptor: function() {
        return {
          enumerable: true,
          configurable: true,
        };
      }
    });
  }

  if (chain) {
    data = new Proxy({}, {
      get: function(_, key) {
        for (var i = 0, len = chain.length; i < len; i ++) {
          var item = chain[i];
          var isObj = typeof item === 'object';
          var attr = isObj ? item.key : item;
          var env = scopeVars[attr];
          if (!env) {
            continue;
          }

          var vars = isObj && item.getter ? item.getter(env) : env;
          if (key in vars) {
            if (collecting) {
              deps.push(key);
            }
            var value = ensureValue(vars[key], vars);
            return value;
          }
        }
      },
      set: function(_, key, value) {
        var bottom;

        for (var i = 0, len = chain.length; i < len; i ++) {
          var item = chain[i];
          var isObj = typeof item === 'object';
          var attr = isObj ? item.key : item;
          var env = scopeVars[attr];
          if (!env) {
            continue;
          }

          var vars = isObj && item.getter ? item.getter(env) : env;

          if (!bottom) {
            bottom = vars;
          }

          if (key in vars) {
            if (isObj && item.setter) {
              item.setter(key, value, vars, env);
            }
            else {
              vars[key] = value;
            }
            return true;
          }
        }

        if (bottom) {
          bottom[key] = value;
        }

        return true;
      },
      deleteProperty: function() {
        return false;
      },
      has: function(_, key) {
        for (var i = 0, len = chain.length; i < len; i ++) {
          var item = chain[i];
          var isObj = typeof item === 'object';
          var attr = isObj ? item.key : item;
          var env = scopeVars[attr];
          if (!env) {
            continue;
          }

          var vars = isObj && item.getter ? item.getter(env) : env;
          if (key in vars) {
            return true;
          }
        }
        return false;
      },
      ownKeys: function() {
        var keys = [];
        for (var i = 0, len = chain.length; i < len; i ++) {
          var item = chain[i];
          var isObj = typeof item === 'object';
          var attr = isObj ? item.key : item;
          var env = scopeVars[attr];
          if (!env) {
            continue;
          }

          var vars = isObj && item.getter ? item.getter(env) : env;
          for (var key in vars) {
            keys.push(key);
          }
        }
        var fkeys = uniqueArray(keys);
        return fkeys;
      },
      getOwnPropertyDescriptor: function() {
        return {
          enumerable: true,
          configurable: true,
        };
      }
    });
  }
  else {
    data = inheritFrom({}, scopeVars);
  }

  var scope = new ScopeX(data, opts);
  if (chain) {
    scope.vars = scopeVars;
    Object.defineProperty(scope, '$new', {
      value: function(locals) {
        var sub = setPrototypeOf(locals, scopeVars);
        return createScope(sub, options);
      }
    });
  }
  else {
    Object.defineProperty(scope, '$new', {
      value: function(locals) {
        var sub = inheritFrom(locals, data);
        return createScope(sub, options);
      }
    });
  }

  var parse = scope.parse.bind(scope);
  Object.defineProperty(scope, 'parse', {
    value: function(exp, fn) {
      if (fn) {
        collecting = true;
      }
      var res = parse(exp);
      if (fn) {
        fn(uniqueArray(deps));
        deps.length = 0;
        collecting = false;
      }
      return res;
    }
  });

  return scope;
}

return ScopeX;

});
