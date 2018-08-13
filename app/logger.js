const pino = require('pino')
const { LOG_LEVEL } = require('./env')

module.exports = pino(
  {
    name: 'ADWISAR_ADAPTER',
    level: LOG_LEVEL,
  },
  process.stdout
)
