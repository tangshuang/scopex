const { ScopeX, createScope } = require('./index')
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

describe('not enum keys', () => {
  test('$parent', () => {
    const o = {}
    Object.defineProperty(o, '$parent', {
      get: () => 'a',
    })

    const scope = new ScopeX(o)
    const newScope = scope.$new({})
    expect(newScope.parse('$parent')).toBe('a')
  })
})

describe('createScope', () => {
  test('nomal', () => {
    const a = {
      b: {
        c: 1,
      }
    }

    const scope = createScope(a)
    expect(scope.parse('b.c')).toBe(1)

    scope.assign('b.c', 2)
    expect(a.b.c).toBe(2)
  })

  test('chain', () => {
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

    const scope = createScope(vars, { chain })
    expect(scope.parse('s')).toBe(1)
    expect(scope.parse('z')).toBe(3)
    expect(scope.parse('w')).toBe(5)

    scope.parse('s = 10')
    expect(vars.a.s).toBe(10)

    scope.parse('z = 13')
    expect(vars.b.z).toBe(13)

    scope.parse('t = 5')
    expect(vars.a.t).toBe(5)
  })

  test('inherit', () => {
    const a = {
      x: 1,
    }
    const b = {
      x: 2,
      y: 3,
    }
    const c = {
      x: 4,
      y: 5,
      z: 6,
    }

    const scope = createScope(c)
    expect(scope.parse('x')).toBe(4)
    expect(scope.parse('y')).toBe(5)
    expect(scope.parse('z')).toBe(6)

    const subscope = scope.$new(b)
    expect(subscope.parse('x')).toBe(2)
    expect(subscope.parse('y')).toBe(3)
    expect(subscope.parse('z')).toBe(6)

    const ascope = subscope.$new(a)
    expect(ascope.parse('x')).toBe(1)
    expect(ascope.parse('y')).toBe(3)
    expect(ascope.parse('z')).toBe(6)

    ascope.assign('x', 12)
    ascope.assign('y', 13)
    ascope.assign('z', 14)
    expect(a.x).toBe(12)
    expect(b.y).toBe(13)
    expect(c.z).toBe(14)
  })

  test('chain inherit', () => {
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
    const chain = ['x', 'a', 'b', 'c']

    const scope = createScope(vars, { chain })
    expect(scope.parse('s')).toBe(1)
    expect(scope.parse('z')).toBe(3)
    expect(scope.parse('w')).toBe(5)

    const subscope = scope.$new({
      x: {
        z: 13,
      },
    })
    expect(subscope.parse('s')).toBe(1)
    expect(subscope.parse('z')).toBe(13)
    expect(subscope.parse('w')).toBe(5)
  })

  test('collect', () => {
    const o = {
      x: 1,
      y: 2,
    }

    const scope = createScope(o)
    let count = 0
    let deps = null
    scope.parse('x + y + z', (keys) => {
      count ++
      deps = keys
    })
    expect(count).toBe(1)
    expect(deps).toEqual(['x', 'y']) // -> z is not in scope
  })
})
