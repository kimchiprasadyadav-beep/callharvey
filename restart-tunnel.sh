#!/bin/bash
# Restart Cloudflare tunnel and update all webhook URLs
set -e

# Kill existing tunnel
pkill -f "cloudflared tunnel --url" 2>/dev/null || true
sleep 2

# Kill and restart backend
pkill -f "uvicorn main:app.*8765" 2>/dev/null || true
sleep 1
cd /Users/kimchi/my-project/callharvey/backend
source .venv/bin/activate
nohup uvicorn main:app --host 0.0.0.0 --port 8765 > /tmp/harvey-server.log 2>&1 &
sleep 2

# Start new tunnel
cloudflared tunnel --url http://localhost:8765 > /tmp/cloudflared.log 2>&1 &
sleep 8

# Extract URL
TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare.com' /tmp/cloudflared.log | tail -1)
if [ -z "$TUNNEL_URL" ]; then
  echo "ERROR: Tunnel failed to start"
  exit 1
fi
echo "Tunnel URL: $TUNNEL_URL"

# Update .env
cd /Users/kimchi/my-project/callharvey/backend
sed -i '' "s|BASE_URL=.*|BASE_URL=$TUNNEL_URL|" .env

# Update Vercel env
cd /Users/kimchi/my-project/callharvey/frontend
PATH="/opt/homebrew/Cellar/node@22/22.22.0/bin:$PATH"
npx vercel env rm NEXT_PUBLIC_API_URL production -y 2>/dev/null || true
echo "$TUNNEL_URL" | npx vercel env add NEXT_PUBLIC_API_URL production 2>/dev/null
npx vercel --prod 2>/dev/null &

# Update Twilio webhooks
source /Users/kimchi/my-project/callharvey/backend/.venv/bin/activate
python3 -c "
import os
from dotenv import load_dotenv
load_dotenv('/Users/kimchi/my-project/callharvey/backend/.env')
from twilio.rest import Client
client = Client(os.getenv('TWILIO_ACCOUNT_SID'), os.getenv('TWILIO_AUTH_TOKEN'))
phone = client.incoming_phone_numbers.list(phone_number='+14242131695')[0]
phone.update(
    sms_url='$TUNNEL_URL/api/sms/webhook',
    voice_url='$TUNNEL_URL/twilio/inbound'
)
print(f'Twilio webhooks updated to $TUNNEL_URL')
" 2>/dev/null || echo "Twilio update failed (check creds)"

echo "Done! Backend: $TUNNEL_URL"
