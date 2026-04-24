#!/bin/sh
# Start the Python AI service in the background on a fixed internal port
python3 -m uvicorn ai.ai_price_api:app --host 127.0.0.1 --port 8001 &

# Start the Node.js backend (uses $PORT assigned by Render)
cd backend && node server.js
