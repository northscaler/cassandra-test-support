'use strict'

const fs = require('fs')
const cassandra = require('cassandra-driver')
const pause = require('./pause')

const startCassandra = require('./start-cassandra')

const defaultContainerName = fs.readFileSync(`${__dirname}/default-cassandra-test-container`).toString('utf8').trim()
const defaultPort = parseInt(fs.readFileSync(`${__dirname}/default-cassandra-test-port`))
const defaultLocalDataCenter = fs.readFileSync(`${__dirname}/default-cassandra-test-local-data-center`).toString('utf8').trim()

let connection

/**
 * Starts a Cassandra container and waits for it to be available.
 * @param {object} [arg0] The Cassandra connection options object to be passed on to the `Client` constructor.
 * @param {string[]} [arg0.contactPoints=[cassandraConnect.defaultContainerName]] The `contactPoints` of the connection.
 * @param {string} [arg0.localDataCenter=cassandraConnect.defaultLocalDataCenter] The `localDataCenter` of the connection options.
 * @param {number} [arg0.protocolOptions.port=cassandraConnect.defaultPort] The `protocolOptions.port` of the connection options.
 * @param {object} [arg1] Connection retry options.
 * @param {number} [arg1.maxTries=10] The max number of tries to connect.
 * @param {number} [arg1.retryPauseMillis=500] The number of milliseconds to pause between connection attempts.
 * @return {Promise<Client>}
 */
async function cassandraConnect ({ // cassandra opts
  contactPoints,
  localDataCenter,
  protocolOptions: {
    port
  } = {}
} = {}, { // cassandraConnect opts
  maxTries = 10,
  retryPauseMillis = 500,
  scriptArgs = [],
  pauseMillis = 0
} = {}) {
  if (connection) return connection

  arguments[0] = arguments[0] || {}
  arguments[0].contactPoints = arguments[0].contactPoints || ['localhost']
  arguments[0].localDataCenter = arguments[0].localDataCenter || defaultLocalDataCenter
  arguments[0].protocolOptions = arguments[0].protocolOptions || { port: defaultPort }

  let start = Date.now()
  if (!process.env.CI) {
    await startCassandra({ scriptArgs, pauseMillis })
    console.log(`started cassandra container in ${Date.now() - start} ms`)
  } else {
    console.log('skipped launching container')
  }

  let tries = 0
  start = Date.now()
  do {
    try {
      connection = new cassandra.Client(arguments[0])
      await connection.execute('select * from system_schema.keyspaces;')
      console.log(`connected to cassandra in ${Date.now() - start} ms`)
    } catch (e) {
      const time = Date.now() - start
      if (++tries >= maxTries) throw e
      console.log(`retrying because connection to cassandra failed after ${time} ms`)
      connection = null
    }

    await pause(retryPauseMillis)
  } while (!connection)

  return connection
}

/**
 * The default test port that Cassandra will listen on for incoming `Client`s.
 * @type {number}
 */
cassandraConnect.defaultPort = defaultPort

/**
 * The default Cassandra test container name.
 * @type {string}
 */
cassandraConnect.defaultContainerName = defaultContainerName

/**
 * The default Cassandra test `localDataCenter` name.
 * @type {string}
 */
cassandraConnect.defaultLocalDataCenter = defaultLocalDataCenter

module.exports = cassandraConnect
