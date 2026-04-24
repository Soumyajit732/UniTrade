FROM node:20-slim

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Python deps
COPY ai/requirements.txt ./ai/requirements.txt
RUN pip3 install --no-cache-dir -r ai/requirements.txt --break-system-packages

# Node deps
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Source
COPY ai/ ./ai/
COPY backend/ ./backend/

COPY start.sh ./start.sh
RUN chmod +x start.sh

EXPOSE 5000

CMD ["./start.sh"]
