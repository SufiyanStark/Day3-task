const axios = require('axios');
const { promises: fs } = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

// Function to send Slack alert
async function sendSlackAlert(domain, daysUntilExpiry) {
  const slackToken = process.env.SLACK_WEBHOOK_URL;

  const slackMessage = `SSL Expiry Alert\n   * Domain : ${domain}\n   * Warning : The SSL certificate for ${domain} will expire in ${daysUntilExpiry} days.`;

  try {
    await axios.post(slackToken, {
      text: slackMessage,
    });

    console.log(`Slack alert sent for ${domain}`);
  } catch (error) {
    console.error(`Error sending Slack alert for ${domain}:`, error);
  }
}

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

main();

