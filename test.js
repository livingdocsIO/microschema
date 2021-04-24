const ms = require('./index')
const test = require('ava').test
const assert = require('assert')

test('obj() creates an object with title and description', function (t) {
  const schema = ms.obj({
    displayName: 'string'
  }, {
    title: 'Title',
    description: 'Desc.'
  })

  assert.deepEqual(schema, {
    type: 'object',
    properties: {
      displayName: {type: 'string'}
    },
    title: 'Title',
    description: 'Desc.'
  })
})

test('obj() creates an object with dependencies', function (t) {
  const schema = ms.obj({
    name: 'string',
    displayName: 'string'
  }, {
    dependencies: {name: 'displayName'}
  })

  assert.deepEqual(schema, {
    type: 'object',
    properties: {
      name: {type: 'string'},
      displayName: {type: 'string'}
    },
    dependencies: {
      name: ['displayName']
    }
  })
})

test('obj() supports a default value', function (t) {
  const schema = ms.obj({
    foo: 'string'
  }, {default: {foo: 'bar'}})

  assert.deepEqual(schema, {
    type: 'object',
    default: {foo: 'bar'},
    properties: {
      foo: {type: 'string'}
    }
  })
})

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

test('const() creates a const value', function (t) {
  const schema = ms.const('foo')
  assert.deepEqual(schema, {
    const: 'foo'
  })
})

test('const() creates a required const value', function (t) {
  const schema = ms.obj({
    foo: ms.required.const('bar')
  })
  assert.deepEqual(schema, {
    type: 'object',
    required: ['foo'],
    properties: {
      foo: {const: 'bar'}
    }
  })
})


test('arrayOf() creates an array with a type of its items', function (t) {
  const schema = ms.arrayOf('integer')
  assert.deepEqual(schema, {
    type: 'array',
    items: {type: 'integer'}
  })
})


test('arrayOf() creates an array with additional properties', function (t) {
  const schema = ms.arrayOf(ms.string(), {
    minItems: 1,
    maxItems: 3,
    uniqueItems: true
  })

  assert.deepEqual(schema, {
    type: 'array',
    items: {type: 'string'},
    minItems: 1,
    maxItems: 3,
    uniqueItems: true
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


test('string({format}) adds a format', function (t) {
  const schema = ms.string({format: 'email'})

  assert.deepEqual(schema, {
    type: 'string',
    format: 'email'
  })
})

test('string({minLength, maxLength}) adds these properties', function (t) {
  const schema = ms.string({minLength: 3, maxLength: 50})

  assert.deepEqual(schema, {
    type: 'string',
    minLength: 3,
    maxLength: 50
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

test('null() creates a null type', function (t) {
  const schema = ms.null()
  assert.deepEqual(schema, {type: 'null'})
})

test('null() can be parsed as string', function (t) {
  const schema = ms.obj({
    foo: 'null'
  })
  assert.deepEqual(schema, {
    type: 'object',
    properties: {
      foo: {type: 'null'}
    }
  })
})

test('types() can create composite types from strings', function (t) {
  const schema = ms.types('string', 'null')
  assert.deepEqual(schema, {type: ['string', 'null']})
})

test('types() works with required', function (t) {
  const schema = ms.obj({
    foo: ms.required.types('string', 'null')
  })
  assert.deepEqual(schema, {
    type: 'object',
    required: ['foo'],
    properties: {
      foo: {
        type: ['string', 'null']
      }
    }
  })
})

test('types() can create composite types', function (t) {
  const schema = ms.types(ms.string(), ms.null())
  assert.deepEqual(schema, {type: ['string', 'null']})
})

test('types() can create composite types with configs', function (t) {
  const schema = ms.types(ms.enum('foo'), ms.number({min: 0}))
  assert.deepEqual(schema, {
    type: ['string', 'number'],
    enum: ['foo'],
    minimum: 0
  })
})

test('types() can create composite types with one object', function (t) {
  const schema = ms.types(ms.number({min: 0}), ms.obj({
    foo: 'string:required'
  }))
  assert.deepEqual(schema, {
    type: ['number', 'object'],
    minimum: 0,
    required: ['foo'],
    properties: {
      foo: {type: 'string'}
    }
  })
})

test('$ref() creates a reference', function (t) {
  const schema = ms.$ref('#/definitions/address')
  assert.deepEqual(schema, {$ref: '#/definitions/address'})
})

test('definitions() adds definitions', function (t) {
  const schema = ms.definitions({
    check: ms.boolean()
  }).strictObj({
    foo: ms.required.$ref('#/definitions/check')
  })

  assert.deepEqual(schema, {
    definitions: {
      check: {type: 'boolean'}
    },
    type: 'object',
    properties: {
      foo: {$ref: '#/definitions/check'}
    },
    required: [ 'foo' ],
    additionalProperties: false
  })
})

test('$id() creates an id', function (t) {
  const schema = ms.$id('#node').obj({
    children: ms.$ref('#node')
  })
  assert.deepEqual(schema, {
    $id: '#node',
    type: 'object',
    properties: {
      children: {$ref: '#node'}
    }
  })
})

test('anyOf() creates an anyOf object', function (t) {
  const schema = ms.anyOf(
    ms.obj({
      foo: 'string'
    }),
    ms.obj({
      bar: 'string'
    })
  )

  assert.deepEqual(schema, {
    anyOf: [{
      type: 'object',
      properties: {foo: {type: 'string'}}
    }, {
      type: 'object',
      properties: {bar: {type: 'string'}}
    }]
  })
})

test('anyOf() works with strings', function (t) {
  const schema = ms.anyOf('string', 'boolean')

  assert.deepEqual(schema, {
    anyOf: [
      {type: 'string'},
      {type: 'boolean'}
    ]
  })
})

test('anyOf() works when passed an array', function (t) {
  const schema = ms.anyOf([
    ms.obj({
      foo: 'string'
    }),
    ms.obj({
      bar: 'string'
    })
  ])

  assert.deepEqual(schema, {
    anyOf: [{
      type: 'object',
      properties: {foo: {type: 'string'}}
    }, {
      type: 'object',
      properties: {bar: {type: 'string'}}
    }]
  })
})

test('anyOf() works with required', function (t) {
  const schema = ms.obj({
    any: ms.required.anyOf(
      ms.obj({
        foo: ms.required.string()
      }),
      ms.obj({
        bar: 'string'
      })
    )
  })

  assert.deepEqual(schema, {
    type: 'object',
    required: ['any'],
    properties: {
      any: {
        anyOf: [{
          type: 'object',
          required: ['foo'],
          properties: {foo: {type: 'string'}}
        }, {
          type: 'object',
          properties: {bar: {type: 'string'}}
        }]
      }
    }
  })
})

test('oneOf() creates a oneOf object', function (t) {
  const schema = ms.oneOf(
    ms.obj({
      foo: 'string'
    }),
    ms.obj({
      bar: 'string'
    })
  )

  assert.deepEqual(schema, {
    oneOf: [{
      type: 'object',
      properties: {foo: {type: 'string'}}
    }, {
      type: 'object',
      properties: {bar: {type: 'string'}}
    }]
  })
})

test('oneOf() works with strings', function (t) {
  const schema = ms.oneOf('number', 'boolean')

  assert.deepEqual(schema, {
    oneOf: [
      {type: 'number'},
      {type: 'boolean'}
    ]
  })
})

test('allOf() creates a allOf object', function (t) {
  const schema = ms.allOf(
    ms.obj({
      foo: 'string'
    }),
    ms.obj({
      bar: 'string'
    })
  )

  assert.deepEqual(schema, {
    allOf: [{
      type: 'object',
      properties: {foo: {type: 'string'}}
    }, {
      type: 'object',
      properties: {bar: {type: 'string'}}
    }]
  })
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
