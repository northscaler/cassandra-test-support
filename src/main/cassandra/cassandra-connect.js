'use strict'

const fs = require('fs')
const cassandra = require('cassandra-driver')
const pause = require('./pause')

const startCassandra = require('./start-cassandra')

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
 * @return {Promise<Client|*>}
 */
async function cassandraConnect ({
  contactPoints = [cassandraConnect.defaultContainerName],
  localDataCenter = cassandraConnect.defaultLocalDataCenter,
  protocolOptions: {
    port = cassandraConnect.defaultPort
  } = {}
} = {}, {
  maxTries = 10,
  retryPauseMillis = 500,
  scriptArgs = [],
  pauseMillis = 0,
  forceStartContainer = false
} = {}) {
  if (connection) return connection

  await startCassandra({ scriptArgs, pauseMillis, forceStartContainer })

  let tries = 0
  do {
    try {
      connection = new cassandra.Client(arguments[0])
      await connection.execute('select * from system_schema.keyspaces;')
    } catch (e) {
      if (++tries >= maxTries) throw e
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
cassandraConnect.defaultPort = parseInt(fs.readFileSync(`${__dirname}/default-cassandra-test-port`))

/**
 * The default Cassandra test container name.
 * @type {string}
 */
cassandraConnect.defaultContainerName = fs.readFileSync(`${__dirname}/default-cassandra-test-container`).toString()

/**
 * The default Cassandra test `localDataCenter` name.
 * @type {string}
 */
cassandraConnect.defaultLocalDataCenter = fs.readFileSync(`${__dirname}/default-cassandra-test-local-data-center`).toString()

module.exports = cassandraConnect
