import * as fs from 'fs';
import * as process from 'process';

export function nodeExtraCACerts(): Buffer | undefined {
  const extraCACertsPath = process.env.NODE_EXTRA_CA_CERTS;
  if (!extraCACertsPath) {
    return undefined;
  }

  // NOTE: This will throw an exception if `extraCACertsPath` does not exist. This is by design; it makes it very clear
  //       to the user if `NODE_EXTRA_CA_CERTS` is not set correctly.
  return fs.readFileSync(extraCACertsPath);
}
