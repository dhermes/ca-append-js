#!/bin/sh

set -e

TLS_CERTS_DIRECTORY="${1}"

# NOTE: ``readlink -f`` is not our friend on macOS.
SCRIPT_FILE=$(python -c "import os; print(os.path.realpath('${0}'))")
BIN_DIR=$(dirname "${SCRIPT_FILE}")
ROOT_DIR=$(dirname "${BIN_DIR}")

docker run \
  --rm \
  --volume "${ROOT_DIR}/_bin/generate-tls-certs-on-alpine.sh":/bin/generate-tls-certs-on-alpine.sh \
  --volume "${ROOT_DIR}/${TLS_CERTS_DIRECTORY}:/var/tls-certs" \
  --env CAROOT=/var/tls-certs \
  golang:1.16.4-alpine3.13 \
  /bin/generate-tls-certs-on-alpine.sh
