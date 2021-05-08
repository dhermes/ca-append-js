import test from 'ava'
import * as axios from 'axios'

import * as caAppend from '../index'

import * as shared from './shared'

// Apply monkey patch for side-effects.
caAppend.monkeyPatch()

test.before(() => {
  shared.runServers()
})

test('Throw exception if `ca` is used when creating an agent', async (t) => {
  const options = shared.makeOptions({ ca: 'not-pem' })
  const expectations = { instanceOf: Error, message: 'tls.createSecureContext(): `ca` option has been deprecated' }
  await t.throwsAsync(axios.default.get(shared.GOOGLE, options), expectations)
})

test('No CA options, public internet works and TLS-localhost does not', async (t) => {
  const options = shared.makeOptions({})
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. cannot hit server for CA1
  const err2 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA1, options))
  shared.requestError(t, err2, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caAppend` (for CA1)', async (t) => {
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1] })
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caAppend` (for CA1); non-array input', async (t) => {
  const options = shared.makeOptions({ caAppend: shared.ROOT_CA1 })
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caAppend` (for CA1); appendNodeExtraCACerts is a no-op', async (t) => {
  // NOTE: This assumes that `NODE_EXTRA_CA_CERTS` is not set.
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1], appendNodeExtraCACerts: true })
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caAppend` (for CA1, CA2)', async (t) => {
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1, shared.ROOT_CA2] })
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. can hit server for CA2
  const response3: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA2, options)
  t.is(200, response3.status)
})

test('Using `caReplace` (for CA1)', async (t) => {
  const options = shared.makeOptions({ caReplace: [shared.ROOT_CA1] })
  // 1. cannot hit Google
  const err1 = await t.throwsAsync(axios.default.get(shared.GOOGLE, options))
  shared.requestError(t, err1, 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'unable to get local issuer certificate')
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caReplace` (for CA1); non-array input', async (t) => {
  const options = shared.makeOptions({ caReplace: shared.ROOT_CA1 })
  // 1. cannot hit Google
  const err1 = await t.throwsAsync(axios.default.get(shared.GOOGLE, options))
  shared.requestError(t, err1, 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'unable to get local issuer certificate')
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
})

test('Using `caReplace` (for CA1, CA2)', async (t) => {
  const options = shared.makeOptions({ caReplace: [shared.ROOT_CA1, shared.ROOT_CA2] })
  // 1. cannot hit Google
  const err1 = await t.throwsAsync(axios.default.get(shared.GOOGLE, options))
  shared.requestError(t, err1, 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'unable to get local issuer certificate')
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const response3: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA2, options)
  t.is(200, response3.status)
})

test('Using `caReplace` (for CA1), `caAppend` (for CA2)', async (t) => {
  const options = shared.makeOptions({ caReplace: [shared.ROOT_CA1], caAppend: [shared.ROOT_CA2] })
  // 1. cannot hit Google
  const err1 = await t.throwsAsync(axios.default.get(shared.GOOGLE, options))
  shared.requestError(t, err1, 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'unable to get local issuer certificate')
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const response3: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA2, options)
  t.is(200, response3.status)
})
