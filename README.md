# `ca-append`

[![npm](https://img.shields.io/npm/v/ca-append.svg?colorB=blue)](https://www.npmjs.com/package/ca-append)

> Monkey-patching Node.js `tls` Module from Standard Library to **append** CAs

## Benchmark

By monkey-patching `tls.createSecureContext`, we are sacrificing native
performance. To understand how much performance we're giving up, we
have a micro-benchmark:

```
$ npm run benchmark

> ca-append@0.0.2-dev benchmark ./ca-append-js
> npm run benchmarkWithout && npm run benchmarkWith && npm run benchmarkNodeExtra


> ca-append@0.0.2-dev benchmarkWithout ./ca-append-js
> ts-node benchmark/withoutImport.ts

with-defaults x 15,077 ops/sec ±1.95% (83 runs sampled)
replace-with-one-CA x 8,225 ops/sec ±1.31% (83 runs sampled)
replace-multiple-CAs x 5,813 ops/sec ±1.08% (84 runs sampled)

> ca-append@0.0.2-dev benchmarkWith ./ca-append-js
> ts-node benchmark/withImport.ts

with-defaults x 14,730 ops/sec ±2.09% (81 runs sampled)
append-CA x 1,736 ops/sec ±1.28% (83 runs sampled)
append-multiple-CAs x 1,588 ops/sec ±1.23% (82 runs sampled)
replace-and-append-CAs x 5,565 ops/sec ±3.11% (85 runs sampled)

> ca-append@0.0.2-dev benchmarkNodeExtra ./ca-append-js
> NODE_EXTRA_CA_CERTS=./test/fixtures/ca2/root-ca-cert.pem ts-node benchmark/nodeExtra.ts

with-defaults x 14,164 ops/sec ±2.76% (80 runs sampled)
append-CA x 1,746 ops/sec ±1.36% (84 runs sampled)
append-CA-and-NODE_EXTRA_CA_CERTS x 1,554 ops/sec ±1.58% (83 runs sampled)
```

## Development

To (re-)generate TLS certificates in `tests/fixtures/`

```
./_bin/generate-tls-certs.sh test/fixtures/ca1
./_bin/generate-tls-certs.sh test/fixtures/ca2
```
