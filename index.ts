/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as tls from 'tls'

export const wrappedTLSCreateSecureContext = tls.createSecureContext

export interface SecureContextOptions extends tls.SecureContextOptions {
  /**
   * List of trusted CA certificates to append to the default chain. If `caReplace` is **also**
   * provided, this field will append to whatever list has replaced the default chain.
   *
   * See: https://nodejs.org/docs/latest-v12.x/api/tls.html#tls_tls_createsecurecontext_options
   */
  caAppend?: string | Buffer | Array<string | Buffer>
  /**
   * List of trusted CA certificates to replace the default chain. This behaves as the original `ca` would behave
   *
   * See: https://nodejs.org/docs/latest-v12.x/api/tls.html#tls_tls_createsecurecontext_options
   */
  caReplace?: string | Buffer | Array<string | Buffer>
  /**
   * This is "necessary" to re-apply the `NODE_EXTRA_CA_CERTS` environment variable in cases where it's ignored.
   * There is a Node.js bug that causes `NODE_EXTRA_CA_CERTS` to be ignored if `ctx.context.addCACert()` has been
   * called on the `SecureContext` returned from `tls.createSecureContext`. So when `caAppend` has been set, we
   * invoke `ctx.context.addCACert()` and invalidate `NODE_EXTRA_CA_CERTS`.
   *
   * This will append `NODE_EXTRA_CA_CERTS` to the default chain if:
   * - `appendNodeExtraCACerts` is `true`
   * - `caAppend` has at least one value
   * - `NODE_EXTRA_CA_CERTS` is set (if this points to an invalid filesystem path, it was cause an error to be thrown)
   *
   * See: https://github.com/nodejs/node/issues/32010
   */
  appendNodeExtraCACerts?: boolean
}

function modifiedCreateSecureContext(details: SecureContextOptions): tls.SecureContext {
  if (details.ca !== undefined) {
    throw new Error('tls.createSecureContext(): `ca` option has been deprecated')
  }

  const detailsWithout = Object.assign({}, details)
  delete detailsWithout.ca
  delete detailsWithout.caAppend
  delete detailsWithout.caReplace
  delete detailsWithout.appendNodeExtraCACerts
  if (details.caReplace !== undefined) {
    detailsWithout.ca = details.caReplace
  }

  const ctx = wrappedTLSCreateSecureContext(detailsWithout)
  return ctx
}

// @ts-ignore
tls.createSecureContext = modifiedCreateSecureContext
