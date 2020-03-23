#!/usr/bin/env sh

# Usage is via env vars:
#   CASSANDRA_TEST_SUPPORT_TAG: docker image tag to use, default "latest"
#   CASSANDRA_TEST_SUPPORT_PORT: visible port to map to container port, default is content of file default-cassandra-test-port
#   CASSANDRA_TEST_SUPPORT_CONTAINER: name of container, default is content of file default-cassandra-test-container
#   CASSANDRA_TEST_SUPPORT_CONTAINER_PORT: cassandra client port in container, default 9042
#   CASSANDRA_TEST_SUPPORT_IMAGE: docker image name, default "cassandra"

THIS_DIR="$(cd "$(dirname "$0")"; pwd)"

CASSANDRA_TEST_SUPPORT_TAG=${CASSANDRA_TEST_SUPPORT_TAG:-latest}
CASSANDRA_TEST_SUPPORT_CONTAINER_PORT=${CASSANDRA_TEST_SUPPORT_CONTAINER_PORT:-9042}
CASSANDRA_TEST_SUPPORT_CONTAINER_IMAGE=${CASSANDRA_TEST_SUPPORT_CONTAINER_IMAGE:-cassandra}

if [ -z "$CASSANDRA_TEST_SUPPORT_CONTAINER" ]; then
  CASSANDRA_TEST_SUPPORT_CONTAINER="$(cat $THIS_DIR/default-cassandra-test-container)"
fi

if [ -z "$CASSANDRA_TEST_SUPPORT_PORT" ]; then
  CASSANDRA_TEST_SUPPORT_PORT="$(cat $THIS_DIR/default-cassandra-test-port)"
fi

RUNNING=$(docker inspect --format="{{ .State.Running }}" "$CASSANDRA_TEST_SUPPORT_CONTAINER" 2> /dev/null)

if [ "$RUNNING" == "true" ]; then
  echo "container '$CASSANDRA_TEST_SUPPORT_CONTAINER' is running - not launching"
  exit 0
fi

# else container is stopped or unknown - forcefully recreate
echo "container '$CASSANDRA_TEST_SUPPORT_CONTAINER' is stopped or unknown - recreating"

# make sure it's gone
docker ps -a | \
  grep "$CASSANDRA_TEST_SUPPORT_CONTAINER" | \
  awk '{ print $1}' | \
  xargs docker rm --force

CMD="docker run --name $CASSANDRA_TEST_SUPPORT_CONTAINER -p $CASSANDRA_TEST_SUPPORT_PORT:$CASSANDRA_TEST_SUPPORT_CONTAINER_PORT -d $CASSANDRA_TEST_SUPPORT_CONTAINER_IMAGE:$CASSANDRA_TEST_SUPPORT_TAG"
echo "$CMD"
$CMD
