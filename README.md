# ScopeX

A javascript eexpression compiler based on angular-expressions. It is a safe js string parser and executer.

## Install

```
npm install --save scopex
```

## Usage

```
var ScopeX = require('scopex')
var scope = new ScopeX($scope)
var normalExpressionResult = scope.parse('1 + 1') // 2
var scopeExpressionResult = scope.parse('key + 1') // if $scope.key = 1, result is 2, here key stands for $scope.key
```

## $scope

A $scope is a js object, if you not passed, it will use `global` and `window` as optional. i.e.

```
var scope = new ScopeX() // global or window passed as default
```

What's a scope? It is an object which will be used as master in parsed string, for example:

```
scope.parse('members[0].name') // will get $scope.members[0].name
```

Variables in parsed string will be treated as a property (or deep property) of $scope.

## API

### filter(name, fn)

To use like `'book.name | toUpperCase'` in your code, you should use `filter` method to add a filter to your instance:

```
scope.filter('toUpperCase', function(value) {
  return value.toUpperCase()
})
```

.filter should be run before any parsing.

### parse(str)

To parse the string expression which depend on $scope.

@return the result of string expression.

### assign(key, value)

Quick way to set value on $scope:

```
scope.assign('members[1].name', 'tomy') // $scope.members[1].name = tomy, even though $scope.members[1] is undefined, this will work.
```
