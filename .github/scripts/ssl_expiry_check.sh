#!/bin/bash

# Read domain names from a file named "domains.txt" in the same directory
while IFS= read -r domain; do
  days_left=$(echo | openssl s_client -servername "$domain" -connect "$domain":443 2>/dev/null | openssl x509 -noout -enddate | cut -d "=" -f 2 | xargs -I {} date -d {} +%s)
  days_left=$(( ($days_left - $(date +%s)) / 86400 ))

  if [ "$days_left" -lt 30 ]; then
    message="SSL Expiry Alert\n   * Domain : $domain\n   * Warning : The SSL certificate for $domain will expire in $days_left days."
    curl -X POST -H 'Content-type: application/json' --data "{\"text\":\"$message\"}" $SLACK_WEBHOOK_URL
  fi
done < "domains.txt"
