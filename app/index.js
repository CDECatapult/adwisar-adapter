const env = require('./env')
const logger = require('./logger')
const { createServer } = require('./server')
const createDFKIClient = require('./dfki')

const dfki = createDFKIClient(
  env.ADWISAR_SCHEMA_ENDPOINT,
  env.ADWISAR_DATA_ENDPOINT
)

createServer(env.HOST, env.PORT, dfki, logger)
