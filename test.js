const microschema = require('./index')
const test = require('ava').test
const assert = require('assert')

test('strictObj() creates an object with a single property', function (t) {
  const schema = microschema.strictObj({foo: 'string'})

  assert.deepEqual(schema, {
    type: 'object',
    additionalProperties: false,
    properties: {
      foo: {type: 'string'}
    }
  })
})

test('strictObj() creates an object with a uri string', function (t) {
  const schema = microschema.strictObj({foo: 'string:uri'})

  assert.deepEqual(schema, {
    type: 'object',
    additionalProperties: false,
    properties: {
      foo: {type: 'string', format: 'uri'}
    }
  })
})

test('strictObj() creates an object with a required property', function (t) {
  const schema = microschema.strictObj({
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
  const schema = microschema.enum('foo', 'bar')
  assert.deepEqual(schema, {
    type: 'string',
    enum: ['foo', 'bar']
  })
})

test('enum() creates an enum from an array', function (t) {
  const schema = microschema.enum(['foo', 'bar'])
  assert.deepEqual(schema, {
    type: 'string',
    enum: ['foo', 'bar']
  })
})


test('arrayOf() creates an array with a type of its items', function (t) {
  const schema = microschema.arrayOf('integer')
  assert.deepEqual(schema, {
    type: 'array',
    items: {type: 'integer'}
  })
})

test('number() creates a type number', function (t) {
  const schema = microschema.number()
  assert.deepEqual(schema, {type: 'number'})
})

test('number() creates a type number with min and max', function (t) {
  const schema = microschema.number({min: 0, max: 10})
  assert.deepEqual(schema, {
    type: 'number',
    minimum: 0,
    maximum: 10
  })
})

test('integer() creates a type number', function (t) {
  const schema = microschema.integer()
  assert.deepEqual(schema, {type: 'integer'})
})

test('integer() creates a type integer with min and max', function (t) {
  const schema = microschema.integer({min: 0, max: 10})
  assert.deepEqual(schema, {
    type: 'integer',
    minimum: 0,
    maximum: 10
  })
})

test('chaining creates a chain object', function (t) {
  const chain = microschema.required
  assert.ok(chain.strictObj instanceof Function)
})

test('chaining creates a required obj', function (t) {
  const schema = microschema.obj({
    myProperty: microschema.required.obj({foo: 'string'})
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
  const schema = microschema.obj({
    myProperty: microschema.required.strictObj({foo: 'string'})
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
  const schema = microschema.obj({
    myProperty: microschema.required.enum('foo', 'bar')
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
