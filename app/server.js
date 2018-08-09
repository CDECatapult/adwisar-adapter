process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const express = require('express')
const bodyParser = require('body-parser')
const pinoHttp = require('pino-http')

const getSchemaMessage = (vendor, id, serial_number, schema) => ({
  time: +new Date(),
  schemas: [
    {
      vendor,
      id,
      serial_number,
      uuid: 'http://www.appsist.de/ontology/demonstrator/Demonstrator',
      station_id: 'SmallDemonstrator',
      site_id: 'PublicDemonstrator',
      schema,
    },
  ],
})

const getSchema = name => ({
  name,
  type: 'bool',
  unit: '',
  visualization_type: 'on_off',
  visualization_level: 'never',
})

const getDataMessage = (vendor, id, serial_number, data) => ({
  time: +new Date(),
  machines: [
    {
      vendor,
      id,
      serial_number,
      uuid: 'http://www.appsist.de/ontology/demonstrator/Demonstrator',
      data,
      status: { code: 0 },
    },
  ],
})

const getData = (name, payload) => ({ [name]: getValue(payload) })

const getValue = payload => {
  const buffer = Buffer.from(payload, 'base64')
  switch (buffer[0]) {
    case 0: // low
      return false
    case 1: // high
      return true
    default:
      throw new Error(`Invalid value: ${buffer[0]}`)
  }
}

const getInfos = devEui => {
  switch (devEui) {
    // Panel 1 - Sensor one (SM1)
    case '4883C7DF30051526':
    case '4883C7DF30051526'.toLowerCase():
      return {
        vendor: 'Airbus',
        id: 'ConnectingUnit',
        serial_number: 'ConnectingUnitSerial',
        name: 'Sidepanel2PlacedInRHGroove',
      }
    // Panel 2 - Sensor two (SM2)
    case '4883C7DF3005179E':
    case '4883C7DF3005179E'.toLowerCase():
      return null
    // Cap 1 (C1)
    case '4883C7DF30051785':
    case '4883C7DF30051785'.toLowerCase():
      return {
        vendor: 'Airbus',
        id: 'ConnectingUnit',
        serial_number: 'ConnectingUnitSerial',
        name: 'Tube2PlacedInCorrectPosition',
      }
    default:
      return null
  }
}

// fport = 1, payload = 0 : LOW
// fport = 1, payload = 1 : HIGH
// fport = 2, payload = 1 : shock
// fport = 3 : reset

function createServer(host, port, dfki, logger) {
  const app = express()

  app.use(
    bodyParser.json({
      type: 'application/vnd.kerlink.iot-v1+json',
    })
  )

  app.use(pinoHttp({ logger }))

  app.post('/rxmessage', async (req, res) => {
    const {
      userdata: { payload, fport },
      devEui,
      msgId,
    } = req.body

    logger.info('rxmessage: ', payload, fport, devEui, msgId)

    // For the small demonstrator we only need to handle low/high
    if (fport === 1) {
      const { vendor, id, serial_number, name } = getInfos(devEui)
      const schemaMessage = getSchemaMessage(
        vendor,
        id,
        serial_number,
        getSchema(name)
      )
      const dataMessage = getDataMessage(
        vendor,
        id,
        serial_number,
        getData(name, payload)
      )

      logger.info('Sending to DFKI', schemaMessage, dataMessage)
      await dfki.send(schemaMessage, dataMessage)
    }

    res.status(204).send()
  })

  app.post('/txmessagestatus', (req, res) => {
    res.status(204).send()
  })

  app.get('/health', (req, res) => {
    res.status(200).send({ status: 'ok' })
  })

  app.use((err, req, res, next) => {
    logger.error('An error occurred', err, err.message)
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.send({ error: err.message })
  })

  app.listen(port, host, err => {
    if (err) {
      logger.error('Binding failed', err)
    } else {
      logger.info(`Server listening on ${host}:${port}`)
    }
  })

  return app
}

module.exports = { createServer }
