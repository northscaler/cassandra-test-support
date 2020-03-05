# `cassandra-test-support`

Handy-dandy Cassandra integration testing utility that starts a local Docker container running Cassandra if you're not running in a CI/CD pipeline.
This allows you to run integration tests locally in a manner similar to how they'd be run in the CI/CD pipeline. 
This module does nothing when running in a CI build pipeline, because Cassandra should be configured as part of the build via something like [`.gitlab-ci.yml`'s `services`](https://docs.gitlab.com/ee/ci/yaml/#services) element.

This package is intended to be installed in your project in `devDependencies`.

Your application must install its desired version of [`cassandra-driver`](https://www.npmjs.com/package/cassandra-driver).

> NOTE: requires a Unix-y shell (`/usr/bin/env sh`) to be available.
>This is not designed to run on Windows; PRs/MRs welcome.

Usage:
```javascript
const cassandraConnect = require('@northscaler/cassandra-test-support')

const client = await cassandraConnect()

// now you can client.execute() CQL statements
```

## Configuration

The default configuration is pretty conventional, with the sole exception of the default port that Cassandra will listen on for clients.
Instead of `9042`, which might already be in use on developers' machines when they run integration tests, the default configuration uses `19042`.
It is a `TODO` to search for an available port.

>NOTE: This module detects when it's running in a CI/CD pipeline by seeing if the environment variable `CI` is of nonzero length.

### Environment variables

The following environment variables can be set to configure it:
* CASSANDRA_TEST_SUPPORT_TAG: The tag of the [`cassandra` Docker image](https://hub.docker.com/_/cassandra)  or custom image to use, default "latest"
* CASSANDRA_TEST_SUPPORT_PORT: visible client port on `localhost` to map to container port, default is content of `cassandra/file default-cassandra-test-port`
* CASSANDRA_TEST_SUPPORT_CONTAINER: name of container, default is content of file `cassandra/default-cassandra-test-container`
* CASSANDRA_TEST_SUPPORT_CONTAINER_PORT: cassandra client port in container, default `9042`
* CASSANDRA_TEST_SUPPORT_IMAGE: docker image name, default `cassandra`
