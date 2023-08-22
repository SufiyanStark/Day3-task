const { WebClient } = require('@slack/web-api');

// Your existing code for checking SSL expiry and sending alerts
const domains = ['example.com', 'anotherdomain.com'];

async function checkExpiry(domain) {
  // ... (your existing code)
}

async function main() {
  const slackToken = process.env.SLACK_WEBHOOK;

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

