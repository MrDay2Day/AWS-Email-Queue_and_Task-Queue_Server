#!/bin/bash

# Set the webhook URL and secret
WEBHOOK_URL="http://192.168.0.220:9000/hooks/redeploy-service"
SECRET="bc78gcbu3r87fg2874bchgg872gc82ecvv24uvxe928hz87gd8972d3g872f"

# Set the payload (in this case, it's a Git ref for redeploying from the main branch)
PAYLOAD='{"ref": "refs/heads/main"}'

# Calculate the HMAC-SHA1 signature using the secret
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha1 -hmac "$SECRET" | cut -d " " -f2)

# Send the POST request with the calculated signature and payload
curl -X POST "$WEBHOOK_URL" \
  -H "X-Hub-Signature: sha1=$SIGNATURE" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD"

# Print success message
echo "Webhook triggered with signature: sha1=$SIGNATURE"
