import * as ava from 'ava'
import * as axios from 'axios'
import * as fs from 'fs'
import * as https from 'https'

import * as caAppend from '../index'

export const GOOGLE = 'https://www.google.com/'
export const PORT_FOR_CA1 = 30457
export const URL_FOR_CA1 = `https://localhost:${PORT_FOR_CA1}`
export const ROOT_CA1 = fs.readFileSync(`${__dirname}/fixtures/ca1/root-ca-cert.pem`)
export const PORT_FOR_CA2 = 24111
export const URL_FOR_CA2 = `https://localhost:${PORT_FOR_CA2}`
export const ROOT_CA2 = fs.readFileSync(`${__dirname}/fixtures/ca2/root-ca-cert.pem`)

export function runServers() {
  // Run server for CA1.
  const optionsForCA1 = {
    key: fs.readFileSync(`${__dirname}/fixtures/ca1/localhost-key.pem`),
    cert: fs.readFileSync(`${__dirname}/fixtures/ca1/localhost-cert.pem`),
  }
  https
    .createServer(optionsForCA1, (_req, res) => {
      res.writeHead(200)
      res.end('hello world\n')
    })
    .listen(PORT_FOR_CA1)

  // Run server for CA2.
  const optionsForCA2 = {
    key: fs.readFileSync(`${__dirname}/fixtures/ca2/localhost-key.pem`),
    cert: fs.readFileSync(`${__dirname}/fixtures/ca2/localhost-cert.pem`),
  }
  https
    .createServer(optionsForCA2, (_req, res) => {
      res.writeHead(200)
      res.end('hello world\n')
    })
    .listen(PORT_FOR_CA2)
}

function allowAnyStatus(): boolean {
  return true
}

export function makeOptions(opts: caAppend.SecureContextOptions): axios.AxiosRequestConfig {
  const pool = new https.Agent({ ...opts, maxSockets: 1 })
  return {
    httpsAgent: pool,
    validateStatus: allowAnyStatus,
    maxRedirects: 0,
  }
}

function isAxiosError(err: Error | axios.AxiosError): err is axios.AxiosError {
  if (err.hasOwnProperty('isAxiosError')) {
    return true
  }
  return false
}

export function requestError(
  t: ava.ExecutionContext,
  err: Error | axios.AxiosError,
  code: string | undefined,
  message: string,
) {
  t.true(isAxiosError(err))
  const axiosError = err as axios.AxiosError
  t.is(code, axiosError.code)
  t.is(message, axiosError.message)
}
