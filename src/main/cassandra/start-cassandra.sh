#!/usr/bin/env sh

# Usage is via env vars:
#   CASSANDRA_TEST_SUPPORT_TAG: docker image tag to use, default "latest"
#   CASSANDRA_TEST_SUPPORT_PORT: visible port to map to container port, default is content of file default-cassandra-test-port
#   CASSANDRA_TEST_SUPPORT_CONTAINER: name of container, default is content of file default-cassandra-test-container
#   CASSANDRA_TEST_SUPPORT_CONTAINER_PORT: cassandra client port in container, default 9042
#   CASSANDRA_TEST_SUPPORT_IMAGE: docker image name, default "cassandra"
#   CASSANDRA_TEST_SUPPORT_FORCE_START_CONTAINER: set to nonzero string to force start even if in CI pipeline, default ""

THIS_DIR="$(cd "$(dirname "$0")"; pwd)"

if [ -n "$CI" ]; then # we're in CI pipeline & not forcing start
  echo 'in CI pipeline; container is assumed to be started'
  exit 0
elif [ -z "$CASSANDRA_TEST_SUPPORT_FORCE_START_CONTAINER" ]; then
  echo 'force-starting container'
fi

CASSANDRA_TEST_SUPPORT_TAG=${CASSANDRA_TEST_SUPPORT_TAG:-latest}
CASSANDRA_TEST_SUPPORT_CONTAINER_PORT=${CASSANDRA_TEST_SUPPORT_CONTAINER_PORT:-9042}
CASSANDRA_TEST_SUPPORT_CONTAINER_IMAGE=${CASSANDRA_TEST_SUPPORT_CONTAINER_IMAGE:-cassandra}

if [ -z "$CASSANDRA_TEST_SUPPORT_CONTAINER" ]; then
  CASSANDRA_TEST_SUPPORT_CONTAINER="$(cat $THIS_DIR/default-cassandra-test-container)"
fi

if [ -z "$CASSANDRA_TEST_SUPPORT_PORT" ]; then
  CASSANDRA_TEST_SUPPORT_PORT="$(cat $THIS_DIR/default-cassandra-test-port)"
fi

if [ -z "$(docker ps --quiet --filter name=$CASSANDRA_TEST_SUPPORT_CONTAINER)" ]; then
  "$THIS_DIR/start-cassandra-container.sh"
fi
