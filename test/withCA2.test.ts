// NOTE: This entire file assumes that NODE_EXTRA_CA_CERTS is set to the path of CA2.

import test from 'ava'
import * as axios from 'axios'

import * as caAppend from '../index'

import * as shared from './shared'

// Apply monkey patch for side-effects.
caAppend.monkeyPatch()

test.before(() => {
  shared.runServers()
})

test('No CA options, NODE_EXTRA_CA_CERTS for CA2', async t => {
  const options = shared.makeOptions({})
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. cannot hit server for CA1
  const err2 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA1, options))
  shared.requestError(t, err2, 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'unable to verify the first certificate')
  // 3. can hit server for CA2
  const response3: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA2, options)
  t.is(200, response3.status)
})

test('Using `caAppend` (for CA1), NODE_EXTRA_CA_CERTS for CA2 ignored due to bug', async t => {
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1] })
  // 1. can hit Google
  const response1: axios.AxiosResponse = await axios.default.get(shared.GOOGLE, options)
  t.is(200, response1.status)
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. can hit server for CA2
  //    ***
  //    **NOTE**: This **should** succeed but fails due to a bug in Node.js
  //              https://github.com/nodejs/node/issues/32010
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'SELF_SIGNED_CERT_IN_CHAIN', 'self signed certificate in certificate chain')
})

test('Using `caAppend` (for CA1), NODE_EXTRA_CA_CERTS for CA2 opt-in via appendNodeExtraCACerts', async t => {
  const options = shared.makeOptions({ caAppend: [shared.ROOT_CA1], appendNodeExtraCACerts: true })
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

test('Using `caReplace` (for CA1), NODE_EXTRA_CA_CERTS is ignored', async t => {
  const options = shared.makeOptions({ caReplace: [shared.ROOT_CA1] })
  // 1. cannot hit Google
  const err1 = await t.throwsAsync(axios.default.get(shared.GOOGLE, options))
  shared.requestError(t, err1, 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY', 'unable to get local issuer certificate')
  // 2. can hit server for CA1
  const response2: axios.AxiosResponse = await axios.default.get(shared.URL_FOR_CA1, options)
  t.is(200, response2.status)
  // 3. cannot hit server for CA2
  const err3 = await t.throwsAsync(axios.default.get(shared.URL_FOR_CA2, options))
  shared.requestError(t, err3, 'SELF_SIGNED_CERT_IN_CHAIN', 'self signed certificate in certificate chain')
})
