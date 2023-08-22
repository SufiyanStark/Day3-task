const axios = require('axios');
const { promises: fs } = require('fs');
const { promisify } = require('util');
const { exec } = require('child_process');

const execPromise = promisify(exec);

async function getSSLCertificateInfo(domain) {
  const { stdout, stderr } = await execPromise(`openssl s_client -connect ${domain}:443 -servername ${domain} < /dev/null 2>/dev/null | openssl x509 -text -noout`);

  // Extract certificate expiration information from the output
  const expirationMatch = /Not After : (.+)/.exec(stdout);
  if (expirationMatch) {
    const expirationDate = new Date(expirationMatch[1]);
    const currentDate = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate - currentDate) / (1000 * 60 * 60 * 24));

    return { daysUntilExpiry };
  }

  return { daysUntilExpiry: -1 }; // Return -1 if expiration information couldn't be retrieved
}

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
    const domains = await fs.readFile('.github/scripts/domains.txt', 'utf-8');
    const domainList = domains.split('\n').filter(domain => domain.trim() !== '');

    let alertMessage = '';  // To store the combined alert message

    for (const domain of domainList) {
      const sslInfo = await getSSLCertificateInfo(domain);
      const domainMessage = `Domain: ${domain}\nDays Until Expiry: ${sslInfo.daysUntilExpiry}`;
      console.log(domainMessage);  // Print the domain message
      alertMessage += domainMessage + '\n\n';  // Combine messages with line breaks
      if (sslInfo.daysUntilExpiry <= 30) {
        await sendSlackAlert(domain, sslInfo.daysUntilExpiry);
      }
    }

    return alertMessage;  // Return the combined alert message
  } catch (error) {
    console.error(error);
  }
}

// Call the main function and handle unhandled promise rejections
main().then(alertMessage => {
  console.log(alertMessage);  // Print the combined alert message
}).catch(error => {
  console.error('Unhandled promise rejection:', error);
});

