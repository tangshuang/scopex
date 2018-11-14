# ScopeX

A javascript eexpression compiler based on angular-expressions. It is a safe js string parser and executer.

## Install

```
npm install --save scopex
```

## Usage

```js
var ScopeX = require('scopex')
var scope = new ScopeX(context)
var normalExpressionResult = scope.parse('1 + 1') // 2
var scopeExpressionResult = scope.parse('key + 1') // if context.key = 1, result is 2, here key stands for context.key
```

## context

A context is a js object, if you not passed, it will use `global` or `window` as optional. i.e.

```js
var scope = new ScopeX() // global or window passed as default
```

What's a scope? It is an object which will be used as master in parsed string, for example:

```js
scope.parse('members[0].name') // will get context.members[0].name
```

Variables in parsed string will be treated as a property (or deep property) of context.

## API

### filter(name, fn)

To use like `'book.name | toUpperCase'` in your code, you should use `filter` method to add a filter to your instance:

```js
scope.filter('toUpperCase', function(value) {
  return value.toUpperCase()
})
```

filters should be added before any parsing.

### parse(str)

To parse the string expression which depend on conteext.

@return the result of string expression.

### assign(key, value)

Quick way to set value on conteext:

```
scope.assign('members[1].name', 'tomy') // conteext.members[1].name = tomy, even though conteext.members[1] is undefined, this will work.
```

### interpolate(str)

Transform a string which contains '{{exp}}' to truthy value string. i.e.

```js
let output = scope.interpolate(`
  <div>{{title}}</div>
  <span>{{name}}</span>
`)
```

The `output` will transform {{title}} and {{name}} to truthy value in string.
