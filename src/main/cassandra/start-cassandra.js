'use strict'

const cp = require('child_process')
const pause = require('./pause')

module.exports = async ({
  scriptArgs = [],
  pauseMillis = 0,
  forceStartContainer = false
} = {}) => {
  if (forceStartContainer) process.env.CASSANDRA_TEST_SUPPORT_FORCE_START_CONTAINER = 1

  cp.execFileSync(`${__dirname}/start-cassandra.sh`, scriptArgs)
  if ((pauseMillis = parseInt(pauseMillis))) await pause(pauseMillis)
}
