#!/bin/sh

# NOTE: It is expected that this script will be run from the root of the
#       repository and that `./node_modules/.bin` will be on the `${PATH}`.

set -e -x

ava lib/test/index.test.js
NODE_EXTRA_CA_CERTS=./test/fixtures/ca2/root-ca-cert.pem ava lib/test/withCA2.test.js
ava lib/test/noImport.test.js
