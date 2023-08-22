const axios = require('axios');
const { promises: fs } = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

async function getSSLCertificateInfo(domain) {
  const { stdout, stderr } = await execPromise(`openssl s_client -connect ${domain}:443 -servername ${domain} < /dev/null 2>/dev/null | openssl x509 -text -noout`);

  const expirationMatch = /Not After : (.+)/.exec(stdout);
  if (expirationMatch) {
    const expirationDate = new Date(expirationMatch[1]);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

    return { domain, daysUntilExpiry };
  }

  return { domain, daysUntilExpiry: -1 };
}

async function main() {
  try {
    const domains = await fs.readFile('.github/scripts/domains.txt', 'utf-8');
    const domainList = domains.split('\n').filter(domain => domain.trim() !== '');

    const alerts = [];

    for (const domain of domainList) {
      const sslInfo = await getSSLCertificateInfo(domain);
      alerts.push(sslInfo);
    }

    return alerts;
  } catch (error) {
    console.error(error);
  }
}

module.exports = main;

