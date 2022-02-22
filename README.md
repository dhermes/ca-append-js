# `ca-append`

[![npm](https://img.shields.io/npm/v/ca-append.svg?colorB=blue)](https://www.npmjs.com/package/ca-append)

> Monkey-patching Node.js `tls` Module from Standard Library to **append** CAs

## Documentation

To use this package:

```ts
import * as caAppend from 'ca-append'
caAppend.monkeyPatch()
```

This package changes the connection options allowed in Node.js 
TLS / HTTPS clients (e.g. `axios`, `request`, `request-promise-native`).
There are four connection options impacted:

-   `ca`: This option from the Node.js standard library has been
    **deprecated**, using it will cause an error.
-   `caAppend`: This option is added by `ca-append`. It appends CA
    certificates to the root trust store.
-   `caReplace`: This option is added by `ca-append`. It replaces the
    the root trust store; it has the same behavior as `ca` but has a name that
    makes this behavior clear.
-   `appendNodeExtraCACerts`: This option is added by `ca-append`. This
    is unlikely to be needed unless an application has a hard requirement that
    both `NODE_EXTRA_CA_CERTS` and `caAppend` must be supported. If set to
    `true`, this indicates that the `NODE_EXTRA_CA_CERTS` should be explicitly
    loaded into a secure context. (This is a workaround to a [bug][1] in
    Node.js.)

The package is only expected to be used for side-effects via `monkeyPatch()`,
though it does export two other members:

-   `monkeyPatch()`: A function that will replace `tls.createSecureContext()`
    with a custom replacement.
-   `wrappedTLSCreateSecureContext()`: The original `tls.createSecureContext()`
    function that has been replaced / monkey-patched.
-   `SecureContextOptions`: The TypeScript interface describing the expanding
    options (i.e. it's `tls.SecureContextOptions` plus the three added above).

## Benchmark

By monkey-patching `tls.createSecureContext`, we are sacrificing native
performance. To understand how much performance we're giving up, we
have a micro-benchmark:

```
$ npm run benchmark

> ca-append@0.1.1-dev benchmark ./ca-append-js
> npm run benchmarkWithout && npm run benchmarkWith && npm run benchmarkNodeExtra


> ca-append@0.1.1-dev benchmarkWithout ./ca-append-js
> ts-node benchmark/withoutImport.ts

with-defaults x 15,077 ops/sec ±1.95% (83 runs sampled)
replace-with-one-CA x 8,225 ops/sec ±1.31% (83 runs sampled)
replace-multiple-CAs x 5,813 ops/sec ±1.08% (84 runs sampled)

> ca-append@0.1.1-dev benchmarkWith ./ca-append-js
> ts-node benchmark/withImport.ts

with-defaults x 14,730 ops/sec ±2.09% (81 runs sampled)
append-CA x 1,736 ops/sec ±1.28% (83 runs sampled)
append-multiple-CAs x 1,588 ops/sec ±1.23% (82 runs sampled)
replace-and-append-CAs x 5,565 ops/sec ±3.11% (85 runs sampled)

> ca-append@0.1.1-dev benchmarkNodeExtra ./ca-append-js
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

[1]: https://github.com/nodejs/node/issues/32010
