# microschema

Helper library to create JSON Schemas in a concise way.

Example:
```js
const microschema = require('microschema')

microschema.strictObj({
  identity_id: 'string:required',
  client_id: 'number',
  redirect_uri: 'string:uri',
  scope: 'string',
  ip_address: 'string',
  children: microschema.arrayOf(microschema.strictObj({
    scope: 'string'
  }))
})
```
