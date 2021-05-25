const ScopeX = require('./index')
const { Objext } = require('objext')

describe('Normal Usage', () => {
  const scope = new ScopeX({
    name: 'tomy',
    age: 10,
  })
  test('parse', () => {
    let name = scope.parse('name')
    expect(name).toBe('tomy')

    let age = scope.parse('age + 1')
    expect(age).toBe(11)
  })
  test('assign', () => {
    scope.assign('sex', 'M')
    let sex = scope.parse('sex')
    expect(sex).toBe('M')
  })
  test('interpolate', () => {
    let output = scope.interpolate(`{{name}} {{age}}`)
    expect(output).toBe('tomy 10')
  })

  test('change value before parse', () => {
    const context = {
      name: 'tomy',
    }
    const sx = new ScopeX(context)

    let name = sx.parse('name')
    expect(name).toBe('tomy')

    // change context
    context.name = 'susan'
    let name2 = sx.parse('name')
    expect(name2).toBe('susan')
  })
})

describe('Use with Objext', () => {
  const context = new Objext({
    name: 'tomy',
    age: 10,
    height: 130,
  })
  const scope = new ScopeX(context)

  test('parse', () => {
    let name = scope.parse('name')
    expect(name).toBe('tomy')
  })

  test('change value', () => {
    context.$set('sex', 'M')
    let sex = scope.parse('sex')
    expect(sex).toBe('M')
  })

  test('interpolate', () => {
    let tpl = '<div>{{name}} {{age}}</div>'
    let html = scope.interpolate(tpl)
    expect(html).toBe('<div>tomy 10</div>')

    context.age = 11
    html = scope.interpolate(tpl)
    expect(html).toBe('<div>tomy 11</div>')
  })

  test('assign', () => {
    let flag = false
    context.$watch('height', () => {
      flag = true
    })
    // only existing property can be assign
    // if you assign a non-existing property, the flat will not change
    scope.assign('height', 135)
    expect(flag).toBe(true)
  })

  test('assign in parse', () => {
    let flag = false
    context.$watch('height', () => {
      flag = true
    })
    // only existing property can be assign
    // if you assign a non-existing property, the flat will not change
    scope.parse('height = 145')
    expect(flag).toBe(true)
  })
})

describe('$new', () => {
  test('new', () => {
    const scope = new ScopeX({ a: { b: 1 } })
    const newScope = scope.$new()
    console.log(newScope.data)

    expect(newScope.parse('a.b')).toBe(1)

    newScope.parse('a.b = 2')
    expect(newScope.parse('a.b')).toBe(2)
    expect(scope.parse('a.b')).toBe(2) // notice here

    newScope.parse('c = 3')
    expect(newScope.parse('c')).toBe(3)
    expect(scope.parse('c')).toBeUndefined() // notice here
  })

  test('inherit', () => {
    const scope = new ScopeX({ a: 1, b: 2, c: { d: 0 } })
    const newScope = scope.$new({ b: 0 })
    expect(newScope.parse('a')).toBe(1)
    expect(newScope.parse('b')).toBe(0)

    newScope.parse('b = 4')
    expect(newScope.parse('b')).toBe(4)
    expect(scope.parse('b')).toBe(2) // notice here

    newScope.parse('a = 3')
    expect(newScope.parse('a')).toBe(3)
    expect(scope.parse('a')).toBe(1) // notice here

    newScope.parse('c.d = 1')
    expect(newScope.parse('c.d')).toBe(1)
    expect(scope.parse('c.d')).toBe(1) // notice here
  })
})

describe('function', () => {
  test('run fn', () => {
    const x = { get: () => 1 }
    const scopex = new ScopeX(x)
    const y = scopex.parse('get()')
    expect(y).toBe(1)
  })
  test('run by $new', () => {
    const x = { get: () => 1 }
    const scopex = new ScopeX(x)
    const scopey = scopex.$new({ b: 2 })
    const y = scopey.parse('get() + b')
    expect(y).toBe(3)
  })
})

describe('$parent', () => {
  const o = {}
  Object.defineProperty(o, '$parent', {
    get: () => 'a',
  })

  const scope = new ScopeX(o, { loose: true })
  const newScope = scope.$new({})
  expect(newScope.parse('$parent')).toBe('a')
})
