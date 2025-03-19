## Installation

1. Stelle sicher, dass Node.js auf deinem System installiert ist
2. Klone das Repository
3. Installiere alle Abhängigkeiten:
```bash
npm run install:all
```

## Konfiguration

1. Erstelle eine `.env` Datei im Root-Verzeichnis mit folgenden Variablen:
```
TEMP_FILE_FOLDER=output
TEMP_PLAY_FOLDER=static/temp
POLLY_KEY_ID=dein_aws_polly_key
POLLY_SECRET_KEY=dein_aws_polly_secret
POLLY_REGION=deine_aws_region
TRANSLATOR_URL=deine_translator_url
TRANSLATOR_KEY=dein_translator_key
IGNORE_TRANSLATOR_SSL_CERT=1
BACKEND_API_URL=http://localhost:5001
```

## Ausführung

### Entwicklung (Frontend + Backend)
```bash
npm run dev
```
Dies startet:
- Backend auf http://localhost:5001
- Frontend Development Server

### Nur Backend
```bash
npm run dev:backend
```

### Nur Frontend
```bash
npm run dev:frontend
```

### Produktion
```bash
npm start
```

## Features

- Text zu SRT Konvertierung
- Sprachsynthese mit AWS Polly
- Mehrsprachige Übersetzung
- Live-Vorschau der generierten Audio
- ZIP-Download der generierten Dateien 