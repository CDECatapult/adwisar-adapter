process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const express = require('express')
const bodyParser = require('body-parser')
const pinoHttp = require('pino-http')

// fport = 1, payload = 0 : LOW
// fport = 1, payload = 1 : HIGH
// fport = 2, payload = 1 : shock
// fport = 3 : reset
function parseEvent(fport, rawPayload) {
  const buffer = Buffer.from(rawPayload, 'base64')
  switch (fport) {
    case 1:
      switch (buffer[0]) {
        case 0:
          return 'low'
        case 1:
          return 'high'
        default:
          return '?'
      }
    case 2:
      return 'shock'
    case 3:
      return 'reset'
    default:
      return '?'
  }
}

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

    const event = parseEvent(fport, payload)
    const time = +new Date()

    logger.info('Sending to DFKI', schema, data)

    await dfki.send(schema, data)

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
