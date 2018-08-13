const env = require('./env')
const logger = require('./logger')
const { createServer } = require('./server')

createServer(env, logger)
