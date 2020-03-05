#!/usr/bin/env sh

# usage: $0 [tag [container [port]]]

THIS_DIR="$(cd "$(dirname "$0")"; pwd)"

DEFAULT_TAG=latest
DEFAULT_CONTAINER="$(cat "$THIS_DIR/default-cassandra-test-container")"
DEFAULT_PORT="$(cat "$THIS_DIR/default-cassandra-test-port")"

TAG=${1:-$DEFAULT_TAG}
CONTAINER="${2:-$DEFAULT_CONTAINER}"
PORT=${3:-$DEFAULT_PORT}

RUNNING=$(docker inspect --format="{{ .State.Running }}" "$CONTAINER" 2> /dev/null)

if [ $? -eq 1 ] || [ "$RUNNING" == "false" ]; then
  echo "container '$CONTAINER' does not exist or is stopped - recreating"
  # make sure it's gone
  docker ps -a | grep "$CONTAINER" | awk '{ print $1}' | xargs docker rm --force

  docker run --name "$CONTAINER" -p $PORT:9042 -d cassandra:$TAG
fi
