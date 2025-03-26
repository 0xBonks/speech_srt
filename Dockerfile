# Use the base image from OpenShift
FROM registry.intra.infineon.com/openshift/ifx-base-ruby:3.1

# Set working directory
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && \
    apt-get install -y curl gnupg && \
    curl -sL https://deb.nodesource.com/setup_16.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy package.json files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY server/package*.json ./server/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Make sure all necessary directories exist
RUN mkdir -p /app/output /app/static/temp

# Build the app
RUN npm run build

# Set environment variables for production
ENV NODE_ENV=production \
    PORT=5001 \
    TEMP_FILE_FOLDER=/app/output \
    TEMP_PLAY_FOLDER=/app/static/temp

# Set permissions for OpenShift
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

# Expose port
EXPOSE 5001

# Start the server
CMD ["npm", "run", "start"] 