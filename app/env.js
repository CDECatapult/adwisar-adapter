const envalid = require('envalid')

const { host, port, url } = envalid

const devEui = envalid.makeValidator(str => {
  if (/^[A-Fa-f0-9]{16}$/.test(str)) {
    return str.toLowerCase()
  } else {
    throw new Error(`${str} is not a valid devEui`)
  }
})

const logLevel = envalid.makeValidator(str => {
  if (/^(debug|info|warn|error|silent)$/.test(str)) {
    return str.toLowerCase()
  } else {
    throw new Error(`${str} is not a valid log level`)
  }
})

module.exports = envalid.cleanEnv(
  process.env,
  {
    HOST: host({
      default: '0.0.0.0',
      desc: 'The host the http server will listen to',
    }),
    PORT: port({
      default: 3000,
      desc: 'The port the http server will bind to',
    }),
    LOG_LEVEL: logLevel({
      default: 'info',
      devDefault: 'debug',
      desc: 'The log level, must be one of debug, info, warn, error or silent',
    }),
    ADWISAR_ENDPOINT: url({ desc: 'the URL of the ADWISAR instance' }),
    PANEL1_DEV_EUI: devEui({
      default: '4883c7df30051526',
      desc: 'The EUI of the device placed at Panel1',
    }),
    PANEL2_DEV_EUI: devEui({
      default: '4883c7df3005179e',
      desc: 'The EUI of the device placed at Panel2',
    }),
    CAP1_DEV_EUI: devEui({
      default: '4883c7df3005148c',
      desc: 'The EUI of the device placed at Cap1',
    }),
    RESET_DEV_EUI: devEui({
      default: '4883c7df3005179e',
      desc: 'The EUI of the device that reset the state',
    }),
  },
  {
    strict: true,
  }
)
