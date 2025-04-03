#!/bin/bash

# Erstelle notwendige Verzeichnisse, falls sie nicht existieren
mkdir -p output
mkdir -p static/temp

# Prüfe, ob .env Datei existiert
if [ ! -f frontend/.env ]; then
    echo "Fehler: frontend/.env Datei nicht gefunden!"
    echo "Bitte erstelle die Datei mit den notwendigen Umgebungsvariablen."
    exit 1
fi

# Baue und starte die Container
echo "Starte Speech SRT Entwicklungsumgebung..."
docker-compose -f docker-compose.dev.yml up --build -d

# Zeige Logs
echo "Container-Logs:"
docker-compose -f docker-compose.dev.yml logs -f 