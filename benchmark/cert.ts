import * as fs from 'fs'

export const CA1_CERT = fs.readFileSync(`${__dirname}/../test/fixtures/ca1/root-ca-cert.pem`)
export const CA2_CERT = fs.readFileSync(`${__dirname}/../test/fixtures/ca2/root-ca-cert.pem`)
