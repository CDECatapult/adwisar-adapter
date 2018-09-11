const test = require('ava')
const pino = require('pino')
const request = require('supertest')
const nock = require('nock')
const { createServer } = require('./app/server')
const schemaConnectingUnit = require('./adwisar-samples/schemas/ConnectingUnitSerial.json')

const env = {
  ADWISAR_ENDPOINT: 'http://adwisar',
  PANEL1_DEV_EUI: '4883c7df30051526',
  PANEL2_DEV_EUI: '4883c7df3005179e',
  CAP1_DEV_EUI: '4883c7df3005148c',
}

const logger = pino({ level: 'silent' })

test('health', async t => {
  const res = await request(createServer(env, logger)).get('/health')
  t.is(res.type, 'application/json')
  t.is(res.text, JSON.stringify({ status: 'ok' }))
})

test('txmessagestatus', async t => {
  const res = await request(createServer(env, logger)).post('/txmessagestatus')
  t.is(res.text, '')
})

test('Send messages to adwisar', async t => {
  t.plan(12)

  const adwisar = nock('http://adwisar')
  const server = request(createServer(env, logger))

  adwisar
    .post('/schema', body => {
      t.deepEqual(body, schemaConnectingUnit)
      return true
    })
    .reply(200)
    .post('/data', body => {
      const data = {
        Sidepanel2PlacedInRHGroove: true,
        Tube2PlacedInCorrectPosition: false,
      }
      t.deepEqual(body.machines[0].data, data)
      return true
    })
    .reply(200)

  const res1 = await server
    .post('/rxmessage')
    .set('Content-Type', 'application/vnd.kerlink.iot-v1+json')
    .send({
      userdata: { payload: 'AQ==', fport: 1 },
      devEui: '4883c7df30051526',
      msgId: '5b3234fb4f05a8000efb4f36',
    })

  t.is(res1.text, '')
  t.true(adwisar.isDone())

  adwisar
    .post('/schema', body => {
      t.deepEqual(body, schemaConnectingUnit)
      return true
    })
    .reply(200)
    .post('/data', body => {
      const data = {
        Sidepanel2PlacedInRHGroove: true,
        Tube2PlacedInCorrectPosition: true,
      }
      t.deepEqual(body.machines[0].data, data)
      return true
    })
    .reply(200)

  const res2 = await server
    .post('/rxmessage')
    .set('Content-Type', 'application/vnd.kerlink.iot-v1+json')
    .send({
      userdata: { payload: '', fport: 1 },
      devEui: '4883c7df3005148c',
      msgId: '5b3234fb4f05a8000efb4f37',
    })

  t.is(res2.text, '')
  t.true(adwisar.isDone())

  adwisar
    .post('/schema', body => {
      t.deepEqual(body, schemaConnectingUnit)
      return true
    })
    .reply(200)
    .post('/data', body => {
      const data = {
        Sidepanel2PlacedInRHGroove: false,
        Tube2PlacedInCorrectPosition: true,
      }
      t.deepEqual(body.machines[0].data, data)
      return true
    })
    .reply(200)

  const res3 = await server
    .post('/rxmessage')
    .set('Content-Type', 'application/vnd.kerlink.iot-v1+json')
    .send({
      userdata: { payload: 'AA==', fport: 1 },
      devEui: '4883c7df30051526',
      msgId: '5b3234fb4f05a8000efb4f38',
    })

  t.is(res3.text, '')
  t.true(adwisar.isDone())
})
