import * as Benchmark from 'benchmark'
import * as tls from 'tls'

import * as cert from './cert'

function withDefaults() {
  return tls.createSecureContext({})
}

function replaceWithOneCA() {
  return tls.createSecureContext({ ca: [cert.CA1_CERT] })
}

function replaceMultipleCAs() {
  return tls.createSecureContext({ ca: [cert.CA1_CERT, cert.CA2_CERT] })
}

function main() {
  const suite = new Benchmark.Suite()
  suite
    .add('with-defaults', withDefaults)
    .add('replace-with-one-CA', replaceWithOneCA)
    .add('replace-multiple-CAs', replaceMultipleCAs)
    .on('cycle', function cycle(event: Benchmark.Event) {
      console.info(String(event.target))
    })
    .run({ async: true })
}

if (require.main === module) {
  main()
}
