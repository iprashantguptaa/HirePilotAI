# Use Node.js 20 with Puppeteer support
FROM ghcr.io/puppeteer/puppeteer:22.6.2

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install as fallback for missing package-lock.json)
RUN npm install --production --no-audit --no-fund

# Copy application code
COPY . .

# Expose port
EXPOSE 5000

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Start the application
CMD ["node", "server.js"]
