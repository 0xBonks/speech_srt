# Use the base image from OpenShift
FROM registry.intra.infineon.com/openshift/ifx-base-ruby:3.1

# Set working directory
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy source code
COPY . .

# Build frontend
WORKDIR /app/frontend
RUN npm install && npm run build

# Install backend dependencies
WORKDIR /app/server
RUN npm install --production

# Create necessary directories
WORKDIR /app
RUN mkdir -p /app/output /app/static/temp

# Set environment variables (these will be overridden by OpenShift)
ENV PORT=5001 \
    TEMP_FILE_FOLDER=/app/output \
    TEMP_PLAY_FOLDER=/app/static/temp \
    NODE_ENV=production

# Set permissions for OpenShift
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "/app/server/server.js"] 