import test from 'ava'
import * as axios from 'axios'

// NOTE: We **do not** import our package; hence no side-effects.

import * as shared from './shared'

test.before(() => {
  shared.runServers()
})

test('Does not throw exception if `ca` is used when creating an agent', async t => {
  const options = shared.makeOptions({ ca: [shared.ROOT_CA1] })
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

test('No CA options, public internet works and TLS-localhost does not', async t => {
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

test('Using `caAppend` is fully ignored', async t => {
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1] })
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

test('Using `caReplace` is fully ignored', async t => {
  const options = shared.makeOptions({ caReplace: [shared.ROOT_CA1] })
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
