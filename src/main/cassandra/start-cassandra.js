'use strict'

const cp = require('child_process')
const pause = require('./pause')

module.exports = async (args, pauseMillis = 0) => {
  cp.execFileSync(`${__dirname}/start-cassandra.sh`, args)
  await pause(pauseMillis)
}
