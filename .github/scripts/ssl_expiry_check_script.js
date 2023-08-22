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

// Function to send Slack alert
async function sendSlackAlert(domain, daysUntilExpiry) {
  const slackToken = process.env.SLACK_WEBHOOK_URL;

  // Debugging: Log domain and daysUntilExpiry
  console.log(`Debug: Domain: ${domain}, Days until expiry: ${daysUntilExpiry}`);

  const slackMessage = `SSL Expiry Alert\n   * Domain : ${domain}\n   * Warning : The SSL certificate for ${domain} will expire in ${daysUntilExpiry} days.`;

  // Debugging: Log the generated slackMessage
  console.log(`Debug: Slack Message: ${slackMessage}`);

  try {
    await axios.post(slackToken, {
      text: slackMessage,
    });

    console.log(`Slack alert sent for ${domain}`);
  } catch (error) {
    console.error(`Error sending Slack alert for ${domain}:`, error);
  }
}

main();

