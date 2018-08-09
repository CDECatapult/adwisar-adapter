const rp = require('request-promise')

const post = (uri, body) =>
  rp({
    method: 'POST',
    uri,
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    json: true,
  })

module.exports = (schemaEndpoint, dataEndpoint) => ({
  async send(schema, data) {
    await post(schemaEndpoint, schema)
    await post(dataEndpoint, data)
  },
})
