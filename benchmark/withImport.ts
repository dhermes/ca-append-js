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

function appendMultipleCAs() {
  const options = { caAppend: [cert.CA1_CERT, cert.CA2_CERT] } as tls.SecureContextOptions
  return tls.createSecureContext(options)
}

function replaceAndAppendCAs() {
  const options = { caAppend: [cert.CA1_CERT], caReplace: [cert.CA2_CERT] } as tls.SecureContextOptions
  return tls.createSecureContext(options)
}

function main() {
  const suite = new Benchmark.Suite()
  suite
    .add('with-defaults', withDefaults)
    .add('append-CA', appendCA)
    .add('append-multiple-CAs', appendMultipleCAs)
    .add('replace-and-append-CAs', replaceAndAppendCAs)
    .on('cycle', function cycle(event: Benchmark.Event) {
      console.info(String(event.target))
    })
    .run({ async: true })
}

if (require.main === module) {
  main()
}
