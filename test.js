const test = require('ava')
const pino = require('pino')
const request = require('supertest')
const { createServer } = require('./app/server')

const env = {}

const logger = pino({ level: 'silent' })

test('/health', async t => {
  const res = await request(createServer(env, logger)).get('/health')
  t.is(res.type, 'application/json')
  t.is(res.text, JSON.stringify({ status: 'ok' }))
})

test('/txmessagestatus', async t => {
  const res = await request(createServer(env, logger)).post('/txmessagestatus')
  t.is(res.text, '')
})

// test('/rxmessage', async t => {
//   const opts = (payload, fport) => ({
//     method: 'POST',
//     uri: `${baseUrl}/rxmessage`,
//     headers: {
//       'Content-Type': 'application/vnd.kerlink.iot-v1+json',
//     },
//     body: {
//       userdata: { payload, fport },
//       devEui: '4883c7df30051784',
//       msgId: '5b3234fb4f05a8000efb4f36',
//     },
//     json: true,
//   })
//
//   const resLow = await rp(opts('AA==', 1))
//   t.is(resLow.devEui, '4883c7df30051784')
//   t.is(resLow.msgId, '5b3234fb4f05a8000efb4f36')
//   t.is(resLow.event, 'low')
//
//   const resHigh = await rp(opts('AQ==', 1))
//   t.is(resHigh.devEui, '4883c7df30051784')
//   t.is(resHigh.msgId, '5b3234fb4f05a8000efb4f36')
//   t.is(resHigh.event, 'high')
//
//   const resShock = await rp(opts('AQ==', 2))
//   t.is(resShock.devEui, '4883c7df30051784')
//   t.is(resShock.msgId, '5b3234fb4f05a8000efb4f36')
//   t.is(resShock.event, 'shock')
//
//   const res3 = await rp(opts('LTQ0MiwxMDAwLDIwMDAsMjAwMA==', 3))
//   t.is(res3.devEui, '4883c7df30051784')
//   t.is(res3.msgId, '5b3234fb4f05a8000efb4f36')
//   t.deepEqual(res3.event, 'reset')
// })
