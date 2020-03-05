#!/usr/bin/env sh

# Usage:
#   via env vars:  CASSANDRA_TEST_SUPPORT_TAG=... CASSANDRA_TEST_SUPPORT_CONTAINER=... CASSANDRA_TEST_SUPPORT_PORT=... $0
#   via args: $0 [tag [container [port]]]

THIS_DIR="$(cd "$(dirname "$0")"; pwd)"

if [ -n "$CI_COMMIT_SHA" ]; then # we're in CI pipeline
  echo 'in pipeline - cassandra is started'
else
  TAG=${1:-$CASSANDRA_TEST_SUPPORT_TAG}
  CONTAINER=${2:-$CASSANDRA_TEST_SUPPORT_HOST}
  PORT=${3:-$CASSANDRA_TEST_SUPPORT_PORT}

  if [ -z "$CONTAINER" ]; then
    CONTAINER="$(cat $THIS_DIR/default-cassandra-test-container)"
  fi
  PORT=${2:-$CASSANDRA_TEST_SUPPORT_PORT}
  if [ -z "$PORT" ]; then
    PORT="$(cat $THIS_DIR/default-cassandra-test-port)"
  fi
  if [ -z "$(docker ps --quiet --filter name=$CONTAINER)" ]; then
    "$THIS_DIR/start-cassandra-container.sh" "$TAG" "$CONTAINER" $PORT
  fi
fi
