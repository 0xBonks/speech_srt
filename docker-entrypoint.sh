#!/bin/sh
set -e

# Überprüfen, ob die notwendigen Umgebungsvariablen gesetzt sind
if [ -z "$POLLY_KEY_ID" ] || [ -z "$POLLY_SECRET_KEY" ]; then
  echo "WARNUNG: AWS Polly Zugangsdaten (POLLY_KEY_ID, POLLY_SECRET_KEY) sind nicht gesetzt"
  echo "Die Sprachsynthese-Funktionen werden nicht funktionieren"
fi

if [ -z "$TRANSLATOR_API_KEY_FREE_DEEPL" ] || [ -z "$TRANSLATOR_URL_FREE_DEEPL" ]; then
  echo "WARNUNG: Übersetzungs-API Zugangsdaten (TRANSLATOR_API_KEY_FREE_DEEPL, TRANSLATOR_URL_FREE_DEEPL) sind nicht gesetzt"
  echo "Die Übersetzungsfunktionen werden nicht funktionieren"
fi

# Server starten
echo "Starte Speech SRT Server auf Port $PORT..."
cd /app/server && node server.js 