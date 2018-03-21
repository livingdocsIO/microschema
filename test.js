const ms = require('./index')
const test = require('ava').test
const assert = require('assert')

test('strictObj() creates an object with a single property', function (t) {
  const schema = ms.strictObj({foo: 'string'})

  assert.deepEqual(schema, {
    type: 'object',
    additionalProperties: false,
    properties: {
      foo: {type: 'string'}
    }
  })
})

test('strictObj() creates an object with a uri string', function (t) {
  const schema = ms.strictObj({foo: 'string:uri'})

  assert.deepEqual(schema, {
    type: 'object',
    additionalProperties: false,
    properties: {
      foo: {type: 'string', format: 'uri'}
    }
  })
})

test('strictObj() creates an object with a required property', function (t) {
  const schema = ms.strictObj({
    foo: 'string:required',
    bar: 'string'
  })

  assert.deepEqual(schema, {
    type: 'object',
    additionalProperties: false,
    required: ['foo'],
    properties: {
      foo: {type: 'string'},
      bar: {type: 'string'}
    }
  })
})


test('enum() creates an enum of strings', function (t) {
  const schema = ms.enum('foo', 'bar')
  assert.deepEqual(schema, {
    type: 'string',
    enum: ['foo', 'bar']
  })
})

test('enum() creates an enum from an array', function (t) {
  const schema = ms.enum(['foo', 'bar'])
  assert.deepEqual(schema, {
    type: 'string',
    enum: ['foo', 'bar']
  })
})


test('arrayOf() creates an array with a type of its items', function (t) {
  const schema = ms.arrayOf('integer')
  assert.deepEqual(schema, {
    type: 'array',
    items: {type: 'integer'}
  })
})

test('string() creates a type string', function (t) {
  const schema = ms.string()
  assert.deepEqual(schema, {type: 'string'})
})

test('required.string() creates a required string', function (t) {
  const schema = ms.obj({
    foo: ms.required.string()
  })
  assert.deepEqual(schema, {
    type: 'object',
    required: ['foo'],
    properties: {
      foo: {
        type: 'string'
      }
    }
  })
})

test('string({pattern}) adds a regex pattern', function (t) {
  const schema = ms.string({
    pattern: '[a-z]+'
  })

  assert.deepEqual(schema, {
    type: 'string',
    pattern: '[a-z]+'
  })
})

test('string({pattern}) accepts a javascript regex', function (t) {
  const schema = ms.string({
    pattern: /[a-z]+/
  })

  assert.deepEqual(schema, {
    type: 'string',
    pattern: '[a-z]+'
  })
})

test('string({pattern}) does not accept a javascript regex with flags', function (t) {
  const method = () => {
    ms.string({pattern: /[a-z]+/i})
  }

  assert.throws(method, (err) => {
    assert.equal(err.message,
      'JSON schema does not support regexp flags: /[a-z]+/i')

    return true
  })
})

test('number() creates a type number', function (t) {
  const schema = ms.number()
  assert.deepEqual(schema, {type: 'number'})
})

test('number() creates a type number with min and max', function (t) {
  const schema = ms.number({min: 0, max: 10})
  assert.deepEqual(schema, {
    type: 'number',
    minimum: 0,
    maximum: 10
  })
})

test('integer() creates a type number', function (t) {
  const schema = ms.integer()
  assert.deepEqual(schema, {type: 'integer'})
})

test('integer() creates a type integer with min and max', function (t) {
  const schema = ms.integer({min: 0, max: 10})
  assert.deepEqual(schema, {
    type: 'integer',
    minimum: 0,
    maximum: 10
  })
})

test('boolean() creates a type boolean', function (t) {
  const schema = ms.boolean()
  assert.deepEqual(schema, {type: 'boolean'})
})

test('chaining creates a chain object', function (t) {
  const chain = ms.required
  assert.ok(chain.strictObj instanceof Function)
})

test('chaining creates a required obj', function (t) {
  const schema = ms.obj({
    myProperty: ms.required.obj({foo: 'string'})
  })

  assert.deepEqual(schema, {
    type: 'object',
    required: ['myProperty'],
    properties: {
      myProperty: {
        type: 'object',
        properties: {
          foo: {type: 'string'}
        }
      }
    }
  })
})

test('chaining creates a required strict obj', function (t) {
  const schema = ms.obj({
    myProperty: ms.required.strictObj({foo: 'string'})
  })

  assert.deepEqual(schema, {
    type: 'object',
    required: ['myProperty'],
    properties: {
      myProperty: {
        type: 'object',
        additionalProperties: false,
        properties: {
          foo: {type: 'string'}
        }
      }
    }
  })
})

test('chaining creates a required enum', function (t) {
  const schema = ms.obj({
    myProperty: ms.required.enum('foo', 'bar')
  })

  assert.deepEqual(schema, {
    type: 'object',
    required: ['myProperty'],
    properties: {
      myProperty: {
        type: 'string',
        enum: ['foo', 'bar']
      }
    }
  })
})
