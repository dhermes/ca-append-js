// NOTE: This entire file assumes that NODE_EXTRA_CA_CERTS is set to the path of CA2.

import * as Benchmark from 'benchmark'
import * as tls from 'tls'

import * as cert from './cert'

import * as caAppend from '../index'

// Apply monkey patch for side-effects.
caAppend.monkeyPatch()

function withDefaults() {
  return tls.createSecureContext({})
}

function appendCA() {
  const options = { caAppend: [cert.CA1_CERT] } as tls.SecureContextOptions
  return tls.createSecureContext(options)
}

function appendCAAndNodeExtra() {
  const options = { appendNodeExtraCACerts: true, caAppend: [cert.CA1_CERT] } as tls.SecureContextOptions
  return tls.createSecureContext(options)
}

function main() {
  const suite = new Benchmark.Suite()
  suite
    .add('with-defaults', withDefaults)
    .add('append-CA', appendCA)
    .add('append-CA-and-NODE_EXTRA_CA_CERTS', appendCAAndNodeExtra)
    .on('cycle', function cycle(event: Benchmark.Event) {
      console.info(String(event.target))
    })
    .run({ async: true })
}

if (require.main === module) {
  main()
}
