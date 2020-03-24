/* global describe, it */
'use strict'

const chai = require('chai')
chai.use(require('dirty-chai'))
const expect = chai.expect
const uuid = require('uuid/v4')

const cassandraConnect = require('../../../main')

describe('integration tests of cassandra', function () {
  describe('cassandra-connect', function () {
    it('should work', async function () {
      if (process.env.CI) { // don't run this in CI pipeline
        console.log('skipping because in CI pipeline')
        return
      }

      this.timeout(100000)

      const client = await cassandraConnect(undefined, {
        connectionErrorListener: (e, tries) => {
          console.log(`After ${tries} tr${tries === 1 ? 'y' : 'ies'}, got error: ${e}:`)
          console.log(e)
        }
      })
      const keyspace = `x${uuid().replace(/-/g, '')}`
      const response = await client.execute(`CREATE KEYSPACE ${keyspace} WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 1};`)
      expect(response?.info?.isSchemaInAgreement).to.be.true()
      expect(await client.execute(`DROP KEYSPACE IF EXISTS ${keyspace}`)).to.be.ok()
    })
  })
})
