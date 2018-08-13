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
  async send(data) {
    await post(schemaEndpoint, {
      vendor: 'Airbus',
      id: 'ConnectingUnit',
      serial_number: 'ConnectingUnitSerial',
      uuid: 'http://www.appsist.de/ontology/demonstrator/Demonstrator',
      station_id: 'SmallDemonstrator',
      site_id: 'PublicDemonstrator',
      site_uuid: '',
      schema: [
        {
          name: 'Sidepanel2PlacedInRHGroove',
          type: 'bool',
          unit: '',
          visualization_type: 'on_off',
          visualization_level: 'never',
        },
        {
          name: 'Tube2PlacedInCorrectPosition',
          type: 'bool',
          unit: '',
          visualization_type: 'on_off',
          visualization_level: 'never',
        },
      ],
    })
    await post(dataEndpoint, {
      time: +new Date(),
      machines: [
        {
          vendor: 'Airbus',
          id: 'ConnectingUnit',
          serial_number: 'ConnectingUnitSerial',
          uuid: 'http://www.appsist.de/ontology/demonstrator/Demonstrator',
          data,
          status: { code: 0 },
        },
      ],
    })
  },
})
