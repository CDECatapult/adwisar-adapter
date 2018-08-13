process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const express = require('express')
const bodyParser = require('body-parser')
const pinoHttp = require('pino-http')
const createDFKIClient = require('./dfki')

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

const state = {
  Sidepanel2PlacedInRHGroove: false,
  Tube2PlacedInCorrectPosition: false,
}

function createServer(env, logger) {
  const dfki = createDFKIClient(
    env.ADWISAR_SCHEMA_ENDPOINT,
    env.ADWISAR_DATA_ENDPOINT
  )

  const setState = (devEui, payload) => {
    switch (devEui) {
      // Panel 1 - Sensor one (SM1)
      case '4883c7df30051526':
        state.Sidepanel2PlacedInRHGroove = !getValue(payload)
        return true
      // Panel 2 - Sensor two (SM2)
      case '4883c7df3005179e':
        return null
      // Cap 1 (C1)
      case '4883c7df3005148c':
        state.Tube2PlacedInCorrectPosition = true
        return true
      default:
        return null
    }
  }

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
    // fport = 1, payload = 0 : LOW
    // fport = 1, payload = 1 : HIGH
    // fport = 2, payload = 1 : shock
    // fport = 3 : reset
    if (fport === 1) {
      const updated = setState(devEui, payload)
      if (updated) {
        logger.info('Sending to DFKI', state)
        await dfki.send(state)
      }
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

  const listener = app.listen(env.PORT, env.HOST, err => {
    if (err) {
      logger.error('Binding failed', err)
    } else {
      const { address, port } = listener.address()
      logger.info(`Server listening on ${address}:${port}`)
    }
  })

  return app
}

module.exports = { createServer }
