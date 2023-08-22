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

