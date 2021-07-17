# ScopeX

A javascript eexpression compiler based on angular-expressions. It is a safe js string parser and executer.

## Install

```
npm install --save scopex
```

## Usage

```js
const { ScopeX } = require('scopex') // or: import ScopeX from 'scopex'

const scope = new ScopeX(context)
const normalExpressionResult = scope.parse('1 + 1') // 2
const scopeExpressionResult = scope.parse('key + 1') // if context.key = 1, result is 2, here key stands for context.key
```

With cdn:

```html
<script src="https://unpkg.com/scopex"></script>
<script>
  const scope = new ScopeX(context)
</script>
```

## context

A context is a js object, default as `{}`.

```js
const scope = new ScopeX()
```

What's a scope? It is an object which will be used as master in parsed string, for example:

```js
scope.parse('members[0].name') // will get context.members[0].name
```

Variables in parsed string will be treated as a property (or deep property) of context.

## API

### filter(name, fn)

Register a filter.
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

### interpolate(str): str

Transform a string which contains '{{exp}}' to truthy value string. i.e.

```js
const output = scope.interpolate(`
  <div>{{title}}</div>
  <span>{{name}}</span>
`)
```

The `output` will transform {{title}} and {{name}} to truthy value in string.

### static createScope(vars: object, options: { chain: string[], filters: Function[] }): ScopeX

```js
const { createScope } = ScopeX
const scope = createScope({ data: context })
```

Use `createScope` to create a scope call properties from chain.

```js
const vars = {
  a: {
    s: 1,
  },
  b: {
    s: 2,
    z: 3
  },
  c: {
    s: 3,
    z: 4,
    w: 5,
  },
}
const chain = ['a', 'b', 'c']

const scope = ScopeX.createScope(vars, chain)
expect(scope.parse('s')).toBe(1)
expect(scope.parse('z')).toBe(3)
expect(scope.parse('w')).toBe(5)
```

Different from `new ScopeX(vars)`, `$new()` is overried by `createScope`, values will not follow prototype partten. The given vars will be treated as one whole thing, change properties will change the ones who has these properties (unless no one the the property, the latest one will be set). Look into unit test to know about this.
