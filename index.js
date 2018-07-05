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

  obj (microschema = {}, {strict, required, title, description, dependencies} = {}) {
    const jsonSchema = {
      type: 'object',
      properties: {}
    }

    if (title) jsonSchema.title = title
    if (description) jsonSchema.description = description
    if (strict) jsonSchema.additionalProperties = false
    if (dependencies) setDependencies(jsonSchema, dependencies)

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


  const (value) {
    return this.decorate({
      type: getJsonType(value),
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
    const items = isString(schemaOrType) ? {type: schemaOrType} : schemaOrType
    const s = this.decorate({
      type: 'array',
      items: items
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

function setDependencies (jsonSchema, dependencies) {
  const formattedDeps = {}
  for (const prop in dependencies) {
    const value = dependencies[prop]
    formattedDeps[prop] = isString(value) ? [value] : value
  }
  jsonSchema.dependencies = formattedDeps
}
