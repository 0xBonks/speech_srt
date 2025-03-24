# Speech SRT Docker Setup

Dieses Repository enthält die notwendigen Dateien, um die Speech SRT Anwendung in Docker zu deployen.

## Voraussetzungen

- Docker und Docker Compose installiert
- AWS Polly Zugangsdaten (für die Sprachsynthese)
- DeepL API Zugangsdaten (für die Übersetzung)

## Konfiguration

1. Erstelle eine `.env` Datei im Root-Verzeichnis mit folgenden Umgebungsvariablen:

```
TEMP_FILE_FOLDER=output
TEMP_PLAY_FOLDER=static/temp
POLLY_KEY_ID=dein_aws_access_key_id
POLLY_SECRET_KEY=dein_aws_secret_access_key
POLLY_REGION=eu-west-1
TRANSLATOR_API_KEY_FREE_DEEPL=dein_deepl_api_key
TRANSLATOR_URL_FREE_DEEPL=https://api-free.deepl.com/v2/translate
IGNORE_TRANSLATOR_SSL_CERT=0
BACKEND_API_URL=http://localhost:5001
```

## Deployment

### Mit Docker Compose (empfohlen)

1. Stelle sicher, dass du im Root-Verzeichnis des Projekts bist
2. Führe folgenden Befehl aus:

```bash
docker-compose up -d
```

Die Anwendung ist dann unter http://localhost:5001 erreichbar.

### Manuelles Docker-Build

1. Image bauen:

```bash
docker build -t speech-srt .
```

2. Container starten:

```bash
docker run -d -p 5001:5001 \
  -e POLLY_KEY_ID=dein_aws_access_key_id \
  -e POLLY_SECRET_KEY=dein_aws_secret_access_key \
  -e POLLY_REGION=eu-west-1 \
  -e TRANSLATOR_API_KEY_FREE_DEEPL=dein_deepl_api_key \
  -e TRANSLATOR_URL_FREE_DEEPL=https://api-free.deepl.com/v2/translate \
  --name speech-srt speech-srt
```

## Datenvolumes

Die Anwendung verwendet zwei Docker-Volumes:

- `speech_srt_output`: Für die generierten Dateien (MP3, SRT, ZIP)
- `speech_srt_temp`: Für temporäre Dateien

## Wartung

- Logs anzeigen:

```bash
docker logs speech-srt
```

- Container neu starten:

```bash
docker restart speech-srt
```

- Container und Volumes löschen:

```bash
docker-compose down -v
```

## Features

- Text zu SRT Konvertierung
- Sprachsynthese mit AWS Polly
- Mehrsprachige Übersetzung
- Live-Vorschau der generierten Audio
- ZIP-Download der generierten Dateien 