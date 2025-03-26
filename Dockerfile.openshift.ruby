# Use the base image from OpenShift
FROM registry.intra.infineon.com/openshift/ifx-base-ruby:3.1

# Set working directory
WORKDIR /app

# Copy pre-built frontend assets (diese müssen auf einem Entwicklungssystem erstellt werden)
COPY frontend/dist /app/frontend/dist

# Copy backend files
COPY server /app/server

# Copy static files
COPY static /app/static

# Install required Node.js packages using package manager available in Ruby image
RUN apt-get update && \
    apt-get install -y nodejs npm && \
    cd /app/server && \
    npm install --production && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create necessary directories
RUN mkdir -p /app/output /app/static/temp

# Set environment variables (these will be overridden by OpenShift secrets)
ENV PORT=5001
ENV TEMP_FILE_FOLDER=/app/output
ENV TEMP_PLAY_FOLDER=/app/static/temp
ENV NODE_ENV=production

# Set permissions for OpenShift
RUN chgrp -R 0 /app && \
    chmod -R g=u /app

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "/app/server/server.js"] 