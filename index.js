// Symbols
const isRequired = Symbol('required')
const chained = Symbol('chained')

// Helper library to create JsonSchemas
// in a concise way.
//
// Example:
//
// microschema.strictObj({
//   identity_id: 'string:required',
//   client_id: 'number',
//   redirect_uri: 'string:uri',
//   scope: 'string',
//   ip_address: 'string',
//   children: microschema.arrayOf(microschema.strictObj({
//     scope: 'string'
//   }))
// })

module.exports = {

  // Chaining Properties
  // -------------------

  get required () {
    const self = chain(this)
    self[isRequired] = true
    return self
  },


  // Methods
  // -------

  obj (microschema = {}, opts = {}) {
    const jsonSchema = {
      type: 'object',
      properties: {}
    }

    if (opts.title) jsonSchema.title = opts.title
    if (opts.description) jsonSchema.description = opts.description
    if (opts.strict) jsonSchema.additionalProperties = false
    if (opts.dependencies) setDependencies(jsonSchema, opts.dependencies)
    if (opts.default !== undefined) jsonSchema.default = opts.default

    if (opts.required) {
      if (!Array.isArray(opts.required)) throw new Error("'required' must be an array")
      jsonSchema.required = opts.required
    }

    for (const propertyName in microschema) {
      const typeDesc = microschema[propertyName]
      let propertySchema

      if (isString(typeDesc)) {
        propertySchema = parseTypeDescription(jsonSchema, propertyName, typeDesc)
      } else {
        propertySchema = typeDesc
        if (typeDesc[isRequired]) {
          jsonSchema.required = jsonSchema.required || []
          jsonSchema.required.push(propertyName)
        }
      }

      jsonSchema.properties[propertyName] = propertySchema
    }

    return decorate(this, jsonSchema)
  },

  // An object with no additional properties allowed
  strictObj (microschema = {}, options = {}) {
    options.strict = true
    return this.obj(microschema, options)
  },

  // @param ...
  //   Pass in all possible values as separate parameters.
  //   All values must be of the same type.
  //
  //   Example:
  //   microschema.enum('error', 'warn', 'info', 'debug', 'trace')
  enum (...enums) {
    if (Array.isArray(enums[0])) enums = enums[0]

    return decorate(this, {
      type: getJsonType(enums[0]),
      enum: enums
    })
  },


  const (value) {
    return decorate(this, {
      const: value
    })
  },

  // @param schemaOrType
  //  Pass in either a string or an object:
  //  1. {String} A json schema type. E.g. 'string'
  //     Example: microschema.arrayOf('string')
  //  2. {Object} JSON Schema
  //     Example: microschema.arrayOf({type: 'object', properties: {...}})
  arrayOf (schemaOrType, {minItems, maxItems, uniqueItems} = {}) {
    const itemSchema = strToSchema(schemaOrType)
    const s = decorate(this, {
      type: 'array',
      items: itemSchema
    })

    if (minItems) s.minItems = minItems
    if (maxItems) s.maxItems = maxItems
    if (uniqueItems) s.uniqueItems = uniqueItems

    return s
  },

  string ({pattern, format, minLength, maxLength} = {}) {
    const s = {type: 'string'}
    if (pattern) {
      if (pattern instanceof RegExp) {
        if (pattern.flags) {
          throw new Error(`JSON schema does not support regexp flags: ${pattern}`)
        }
        s.pattern = pattern.source
      } else {
        s.pattern = pattern
      }
    }

    if (format) s.format = format
    if (minLength) s.minLength = minLength
    if (maxLength) s.maxLength = maxLength

    return decorate(this, s)
  },

  number ({min, max, integer} = {}) {
    const type = integer ? 'integer' : 'number'
    const s = {type: type}
    if (min != null) s.minimum = min
    if (max != null) s.maximum = max
    return decorate(this, s)
  },

  integer (opts = {}) {
    opts.integer = true
    return this.number(opts)
  },

  boolean () {
    return decorate(this, {type: 'boolean'})
  },

  null () {
    return decorate(this, {type: 'null'})
  },

  types (...params) {
    const result = {}
    for (let obj of params) {
      if (isString(obj)) {
        obj = parseTypeDescription({}, '', obj)
      }
      mergeTypes(obj, result)
      Object.assign(result, obj)
    }
    return decorate(this, result)
  },

  definitions (obj) {
    const self = chain(this)
    self[chained].definitions = obj
    return self
  },

  $ref (reference) {
    return decorate(this, {$ref: reference})
  },

  $id (id) {
    const self = chain(this)
    self[chained].$id = id
    return self
  },

  anyOf (...args) {
    const defs = Array.isArray(args[0]) ? args[0] : args
    return decorate(this, {anyOf: defs.map(strToSchema)})
  },

  oneOf (...args) {
    const defs = Array.isArray(args[0]) ? args[0] : args
    return decorate(this, {oneOf: defs.map(strToSchema)})
  },

  allOf (...args) {
    const defs = Array.isArray(args[0]) ? args[0] : args
    return decorate(this, {allOf: defs})
  }
}

function decorate (self, obj) {
  if (self[isRequired]) obj[isRequired] = true
  if (self[chained]) Object.assign(obj, self[chained])
  return obj
}

function mergeTypes (obj, other) {
  if (obj.type && other.type) {
    const first = Array.isArray(obj.type)
      ? obj.type
      : [obj.type]
    const second = Array.isArray(other.type)
      ? other.type
      : [other.type]

    second.push(...first)
    obj.type = second
  }
}

function parseTypeDescription (parentSchema, name, typeDesc) {
  const [type, ...options] = typeDesc.split(':')
  const propertySchema = {type: type}

  for (const option of options) {
    if (option === 'uri') {
      propertySchema.format = 'uri'
    }

    if (option === 'required') {
      parentSchema.required = parentSchema.required || []
      parentSchema.required.push(name)
    }

    if (Math.floor(option)) {
      propertySchema.minLength = 1
      propertySchema.maxLength = Math.floor(option)
    }
  }

  return propertySchema
}

function strToSchema (schemaOrType) {
  return isString(schemaOrType) ? {type: schemaOrType} : schemaOrType
}

function chain (self) {
  if (self[chained]) return self
  self = Object.create(self)
  self[chained] = {}
  return self
}

function getJsonType (obj) {
  if (isString(obj)) return 'string'
  if (Array.isArray(obj)) return 'array'
  if (isNumber(obj)) return 'number'
  if (obj == null) return 'null'
  return 'object'
}

function isString (str) {
  return typeof str === 'string'
}

function isNumber (nr) {
  return typeof nr === 'number'
}

function setDependencies (jsonSchema, dependencies) {
  const formattedDeps = {}
  for (const prop in dependencies) {
    const value = dependencies[prop]
    formattedDeps[prop] = isString(value) ? [value] : value
  }
  jsonSchema.dependencies = formattedDeps
}
