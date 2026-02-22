#!/bin/bash
curl -X POST http://localhost:8000/api/telnyx/call \
  -H "Content-Type: application/json" \
  -d '{
    "lead_phone": "+917757735839",
    "lead_name": "Rambo",
    "agent_name": "Harvey",
    "brokerage": "Harvey Realty",
    "area": "Dubai Marina"
  }'
