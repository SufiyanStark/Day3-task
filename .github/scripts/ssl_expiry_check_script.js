const https = require('https');
const { WebClient } = require('@slack/web-api');

// Replace these with your actual values
const domains = ['example.com', 'anotherdomain.com'];
const slackToken = process.env.SLACK_WEBHOOK;

async function checkExpiry(domain) {
  const options = {
    host: domain,
    port: 443,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      const expires = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((expires - new Date()) / (1000 * 60 * 60 * 24));
      resolve(daysUntilExpiry);
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

async function main() {
  const slack = new WebClient(slackToken);

  for (const domain of domains) {
    try {
      const daysUntilExpiry = await checkExpiry(domain);

      // Send Slack alert
      await slack.chat.postMessage({
        channel: '#ssl-expiry-alerts', // Replace with your Slack channel
        text: `SSL Expiry Alert\n   * Domain : ${domain}\n   * Warning : The SSL certificate for ${domain} will expire in ${daysUntilExpiry} days.`,
      });
    } catch (error) {
      console.error(`Error checking SSL expiry for ${domain}:`, error);
    }
  }
}

main();
