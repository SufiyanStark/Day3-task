const axios = require('axios');
const { promises: fs } = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

async function main() {
  try {
    const domains = await fs.readFile('domains.txt', 'utf-8');
    const domainList = domains.split('\n').filter(domain => domain.trim() !== '');

    for (const domain of domainList) {
      const sslInfo = await getSSLCertificateInfo(domain);
      if (sslInfo.daysUntilExpiry <= 30) {
        await sendSlackAlert(domain, sslInfo.daysUntilExpiry);
      }
    }
  } catch (error) {
    console.error(error);
  }
}
// Rest of the script (refer to previous responses for full script)

main();

