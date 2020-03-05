/* global describe, it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const uuid = require('uuid/v4')

const cassandraConnect = require('../../../main/cassandra')

const contactPoints = process.env.CASSANDRA_TEST_SUPPORT_HOST?.trim()
const port = parseInt(process.env.CASSANDRA_TEST_SUPPORT_PORT?.trim())
const localDataCenter = process.env.CASSANDRA_TEST_SUPPORT_LOCAL_DATA_CENTER?.trim() || 'datacenter1'

describe('integration tests of cassandra', function () {
  describe('cassandra-connect', function () {
    it('should work', async function () {
      this.timeout(100000)
      const client = await cassandraConnect({
        contactPoints: contactPoints?.split(',').map(it => it.trim()) || ['localhost'],
        localDataCenter,
        protocolOptions: {
          port: port || cassandraConnect.defaultPort
        }
      })
      const keyspace = `x${uuid().replace(/-/g, '')}`
      const response = await client.execute(`CREATE KEYSPACE ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};`)
      expect(response?.info?.isSchemaInAgreement).to.be.true()
      expect(await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace}`)).to.be.ok()
    })
  })
})
