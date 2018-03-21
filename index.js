// Symbols
const isChain = Symbol('chainedMicroschema')
const isRequired = Symbol('required')

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
    const chain = Object.create(this)
    chain[isChain] = true
    chain[isRequired] = true
    return chain
  },


  // Methods
  // -------

  obj (microschema = {}, {strict, required} = {}) {
    const jsonSchema = {
      type: 'object',
      properties: {}
    }

    if (strict) jsonSchema.additionalProperties = false

    if (required) {
      if (!Array.isArray(required)) throw new Error("'required' must be an array")
      jsonSchema.required = required
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

    return this.decorate(jsonSchema)
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

    return this.decorate({
      type: getJsonType(enums[0]),
      enum: enums
    })
  },

  // @param schemaOrType
  //  Pass in either a string or an object:
  //  1. {String} A json schema type. E.g. 'string'
  //     Example: microschema.arrayOf('string')
  //  2. {Object} JSON Schema
  //     Example: microschema.arrayOf({type: 'object', properties: {...}})
  arrayOf (schemaOrType) {
    const items = isString(schemaOrType) ? {type: schemaOrType} : schemaOrType

    return this.decorate({
      type: 'array',
      items: items
    })
  },

  string ({pattern} = {}) {
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
    return this.decorate(s)
  },

  number ({min, max, integer} = {}) {
    const type = integer ? 'integer' : 'number'
    const s = {type: type}
    if (min != null) s.minimum = min
    if (max != null) s.maximum = max
    return this.decorate(s)
  },

  integer (opts = {}) {
    opts.integer = true
    return this.number(opts)
  },

  boolean () {
    return this.decorate({type: 'boolean'})
  },

  decorate (obj) {
    if (this[isRequired]) obj[isRequired] = true
    return obj
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
