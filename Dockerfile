# Build stage for frontend
FROM node:20-alpine as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Build stage for backend
FROM node:20-alpine as backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ .

# Final stage
FROM node:20-alpine
WORKDIR /app

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
COPY --from=frontend-build /app/frontend/package*.json /app/frontend/

# Copy backend
COPY --from=backend-build /app/server /app/server

# Copy static files
COPY static /app/static

# Install production dependencies
WORKDIR /app/server
RUN npm install --production

# Set environment variables
ENV PORT=5001
ENV TEMP_FILE_FOLDER=/app/output
ENV TEMP_PLAY_FOLDER=/app/static/temp
ENV NODE_ENV=production

# Create necessary directories
RUN mkdir -p /app/output /app/static/temp

# Expose port
EXPOSE 5001

# Start the server
CMD ["node", "server.js"] 