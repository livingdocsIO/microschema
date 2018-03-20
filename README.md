# microschema

<p align="center">
  <a href="https://travis-ci.org/upfrontIO/microschema">
    <img alt="Travis" src="https://img.shields.io/travis/upfrontIO/microschema/master.svg">
  </a>
  <a href="https://semantic-release.gitbooks.io/semantic-release/content/#highlights">
    <img alt="semantic-release" src="https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg">
  </a>
  <a href="https://www.npmjs.com/package/microschema">
    <img alt="npm latest version" src="https://img.shields.io/npm/v/microschema/latest.svg">
  </a>
</p>


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
