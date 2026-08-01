# Use official Node.js 20 Alpine image for smaller size
FROM node:20-alpine

# Install system dependencies for Puppeteer and canvas
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    cairo \
    pango \
    giflib \
    libjpeg-turbo \
    pixman

# Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application code
COPY . .

# Expose port (Railway will override this with PORT env var)
EXPOSE 3000

# Start the application
CMD ["node", "server.js"]
