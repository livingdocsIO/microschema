<p align="right">
  <a href="https://travis-ci.org/upfrontIO/microschema">
    <img alt="Travis" src="https://img.shields.io/travis/upfrontIO/microschema/master.svg">
  </a>
  <a href="https://www.npmjs.com/package/microschema">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/microschema/latest.svg">
  </a>
  <a href="https://semantic-release.gitbooks.io/semantic-release/content/#highlights">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
</p>

# microschema

Small library without dependencies to create JSON Schemas in a concise way.

Example:
```js
const ms = require('microschema')

ms.strictObj({
  identityId: 'string:required',
  clientId: 'number',
  redirectUri: 'string:uri',
  scope: 'string',
  ipAddress: ms.string({pattern: ''}),
  children: ms.arrayOf(ms.strictObj({
    scope: 'string'
  }))
})
```


## Strings

Using the `ms.string()` method:
```js
ms.string()
output = {type: 'string'})
```

```js
ms.string({pattern: '[a-z]+'})

// Passing a javascript RegExp is equivalent to the above
ms.string({pattern: /[a-z]+/})

output = {
  type: 'string',
  pattern: '[a-z]+'
}
```

Setting the required flag (only possible within an object):
```js
ms.obj({
  foo: ms.required.string()
})

output = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: {
      type: 'string'
    }
  }
}
```

Simplified usage within objects:
```js
ms.obj({
  foo: 'string'
})

output = {
  type: 'object',
  properties: {
    foo: {
      type: 'string'
    }
  }
}
```

```js
ms.obj({
  foo: 'string:required'
})

output = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: {
      type: 'string'
    }
  }
}
```

## Numbers and Integers

Simplified usage within objects:
```js
ms.obj({
  foo: 'string'
})
```

Using the `ms.number()` method:
```js
ms.number()
output = {type: 'number'}
```

```js
ms.number({min: 0, max: 10})

output = {
  type: 'number',
  minimum: 0,
  maximum: 10
}
```

Using the `ms.integer()` method:
```js
ms.integer()
output = {type: 'integer'}
```

The `integer()` methods also accepts `min` and `max` params the same as `number()` does.


## Booleans

```js
ms.boolean()
output = {type: 'boolean'})
```

Simplified usage within objects:
```js
ms.obj({
  foo: 'boolean:required'
})

output = {
  type: 'object',
  required: ['foo'],
  properties: {
    foo: {
      type: 'boolean'
    }
  }
}
```

## Objects

```js
ms.obj()
output = {type: 'object'}
```

Don't allow additional properties with `strictObj()`:
```js
ms.strictObj({
  count: ms.integer()
})

output = {
  type: 'object',
  additionalProperties: false,
  properties: {
    count: {type: 'integer'}
  }
}
```

## Arrays

```js
ms.arrayOf(ms.string())

output = {
  type: 'array',
  items: {type: 'string'}
}
```

You can use these additional modifiers:
```js
ms.arrayOf(ms.string(), {minItems: 1, maxItems: 3, uniqueItems: true})

output = {
  type: 'array',
  items: {type: 'string'},
  minItems: 1,
  maxItems: 3,
  uniqueItems: true
}
```

## Enumerations

```js
// All values in an enumeration must be of the same type.
ms.enum('foo', 'bar')

output = {
  type: 'string',
  enum: ['foo', 'bar']
}
```

## Constant Value

```js
ms.const('foo')

// The output is the same as ms.enum('foo') as there is no equivalent
// to value in JSON schema.
output = {
  type: 'string',
  const: 'foo'
}
```
