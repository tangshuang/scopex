const ScopeX = require('./index')

describe('TEST', () => {
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
})
