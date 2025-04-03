# Lokale Entwicklung mit Docker

Diese Anleitung beschreibt, wie du die Speech SRT Anwendung lokal mit Docker entwickeln und testen kannst.

## Voraussetzungen

- Docker und Docker Compose installiert
- Eine `.env` Datei im `frontend` Verzeichnis mit den notwendigen Umgebungsvariablen

## Umgebungsvariablen

Die `.env` Datei sollte die folgenden Variablen enthalten:

```env
POLLY_KEY_ID=dein_aws_key
POLLY_SECRET_KEY=dein_aws_secret
POLLY_REGION=eu-west-1
TRANSLATOR_API_KEY_FREE_DEEPL=dein_deepl_key
TRANSLATOR_URL_FREE_DEEPL=https://api-free.deepl.com/v2/translate
```

## Entwicklungsumgebung starten

1. Stelle sicher, dass die Skripte ausführbar sind:
   ```bash
   chmod +x scripts/dev.sh scripts/stop.sh
   ```

2. Starte die Entwicklungsumgebung:
   ```bash
   ./scripts/dev.sh
   ```

3. Die Anwendung ist dann unter http://localhost:5001 erreichbar

## Entwicklungsumgebung stoppen

```bash
./scripts/stop.sh
```

## Verzeichnisstruktur

Die lokale Entwicklungsumgebung verwendet folgende Verzeichnisse:
- `output/`: Für generierte Dateien
- `static/temp/`: Für temporäre Dateien

Diese Verzeichnisse werden automatisch erstellt, wenn sie nicht existieren.

## Troubleshooting

### Container startet nicht

1. Prüfe die Logs:
   ```bash
   docker-compose -f docker-compose.dev.yml logs
   ```

2. Stelle sicher, dass die `.env` Datei korrekt konfiguriert ist

3. Prüfe, ob die Ports frei sind:
   ```bash
   lsof -i :5001
   ```

### Dateien werden nicht gespeichert

1. Prüfe die Berechtigungen der Verzeichnisse:
   ```bash
   ls -la output/
   ls -la static/temp/
   ```

2. Stelle sicher, dass die Volumes korrekt gemountet sind:
   ```bash
   docker inspect speech-srt | grep Mounts
   ```