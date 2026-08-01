# Use Node.js 20 with Puppeteer support
FROM ghcr.io/puppeteer/puppeteer:22.6.2

# Set working directory
WORKDIR /app

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Copy package files
COPY package*.json ./

# Install dependencies (use npm install as fallback for missing package-lock.json)
RUN npm install --production --no-audit --no-fund

# Copy application code
COPY . .

# Expose port (Railway will map this automatically)
EXPOSE 5000

# Start the application
# Railway automatically injects environment variables at runtime
CMD ["node", "server.js"]
