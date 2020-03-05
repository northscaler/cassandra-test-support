# `cassandra-test-support`

Handy-dandy Cassandra integration testing utility that starts a local Docker container running Cassandra if you're not running in a CI/CD pipeline.
This allows you to run integration tests locally in a manner similar to how they'd be run in the CI/CD pipeline. 

This is intended to be installed in your project in `devDependencies`.

> NOTE: requires a Unix-y shell (`/usr/bin/env sh`) to be available.
>This is not designed to run on Windows; PRs/MRs welcome.
>If you're on Windows, use the Linux subsystem (if you don't have that, sorry).

See [src/test/integration/cassandra/cassandra.spec.js] for usage, but it's basically
```javascript
const cassandraConnect = require('cassandra-connect')

const client = await cassandraConnect()

// now you can client.execute() CQL statements
```

## Configuration

The default configuration is pretty conventional, with the sole exception of the default port that Cassandra will listen on for clients.
Instead of `9042`, which might already be in use on developers' machines when they run integration tests, the default configuration uses `19042`.
It is a `TODO` to search for an available port.

>NOTE: This module detects when it's running in a CI/CD pipeline by seeing if the environment variable `CI_COMMIT_SHA` is of nonzero length.

### Environment variables

The following environment variables can be set to configure it:
* CASSANDRA_TEST_SUPPORT_TAG: The tag of the [`cassandra` Docker image](https://hub.docker.com/_/cassandra)  or custom image to use, default "latest"
* CASSANDRA_TEST_SUPPORT_PORT: visible client port on `localhost` to map to container port, default is content of `cassandra/file default-cassandra-test-port`
* CASSANDRA_TEST_SUPPORT_CONTAINER: name of container, default is content of file `cassandra/default-cassandra-test-container`
* CASSANDRA_TEST_SUPPORT_CONTAINER_PORT: cassandra client port in container, default `9042`
* CASSANDRA_TEST_SUPPORT_IMAGE: docker image name, default `cassandra`
