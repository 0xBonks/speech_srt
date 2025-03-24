FROM node:18-alpine

# Arbeitsverzeichnis setzen
WORKDIR /app

# Abhängigkeiten für die Anwendung installieren
RUN apk add --no-cache python3 make g++ zip

# Kopiere package.json Dateien zuerst, um Abhängigkeiten zu cachen
COPY frontend/package*.json ./frontend/
COPY server/*.js ./server/

# Installiere Abhängigkeiten für Frontend
WORKDIR /app/frontend
RUN npm install

# Baue Frontend
RUN npm run build

# Zurück zum Hauptverzeichnis
WORKDIR /app

# Installiere Abhängigkeiten für Backend
RUN cd server && npm install --only=production

# Kopiere den Rest der Anwendung
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public
COPY frontend/index.html ./frontend/
COPY frontend/vite.config.js ./frontend/
COPY static ./static

# Erstelle notwendige Verzeichnisse
RUN mkdir -p static/temp
RUN mkdir -p output

# Umgebungsvariablen setzen
ENV PORT=5001
ENV TEMP_FILE_FOLDER=output
ENV TEMP_PLAY_FOLDER=static/temp
ENV NODE_ENV=production

# Exponiere den Port
EXPOSE 5001

# Startskript hinzufügen
COPY docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh

# Starte die Anwendung
ENTRYPOINT ["/docker-entrypoint.sh"] 