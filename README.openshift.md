# OpenShift Deployment

Dieses Dokument beschreibt, wie die Anwendung in OpenShift bereitgestellt wird.

## Deployment-Dateien

- `Dockerfile.openshift`: Angepasste Dockerfile für OpenShift, die das ifx-base-ruby:3.1 Basisimage verwendet und Node.js bei Bedarf installiert
- `Dockerfile.openshift.ruby`: Alternative Dockerfile, die nur das Ruby-Image verwendet und vorgefertigte Frontend-Assets erwartet
- Die ursprüngliche BuildConfig von OpenShift

## Build-Probleme und Lösungen

Bei der Bereitstellung unter OpenShift können folgende Probleme auftreten:

1. **Blockierte externe Registries**: OpenShift kann externe Image-Registries (wie docker.io) blockieren, was zum Fehlschlagen des Builds führen kann.
2. **Node.js Installation**: Wenn Node.js nicht im Basis-Image vorhanden ist, muss es über den Paketmanager installiert werden.

### Lösungsansätze:

1. **Standard-Ansatz (Dockerfile.openshift)**: 
   - Verwendet das ifx-base-ruby:3.1 Basisimage
   - Prüft, ob Node.js installiert ist, und installiert es bei Bedarf über den Paketmanager
   - Baut Frontend und Backend im Container

2. **Alternativer Ansatz (Dockerfile.openshift.ruby)**:
   - Erfordert, dass das Frontend vorab lokal gebaut wird
   - Kopiert nur die kompilierten Frontend-Assets in den Container
   - Minimale Node.js-Installation nur für den Backend-Server

## Umgebungsvariablen

Die folgenden Umgebungsvariablen werden aus OpenShift-Secrets geladen:

- `POLLY_KEY_ID`: AWS Polly API Key ID
- `POLLY_SECRET_KEY`: AWS Polly Secret Key
- `POLLY_REGION`: AWS Polly Region (z.B. eu-west-1)
- `TRANSLATOR_API_KEY_FREE_DEEPL`: DeepL API Key
- `TRANSLATOR_URL_FREE_DEEPL`: DeepL API URL
- `IGNORE_TRANSLATOR_SSL_CERT`: SSL-Zertifikatprüfung für DeepL API ignorieren (0 oder 1)

## Architektur

Die Anwendung besteht aus:

1. **Frontend**: Eine Vue.js-Anwendung, die während des Build-Prozesses in statische Dateien kompiliert wird
2. **Backend**: Ein Node.js-Server, der sowohl die statischen Frontend-Dateien als auch die API-Endpunkte bereitstellt

## Deployment-Prozess

1. OpenShift verwendet die BuildConfig, um das Dockerfile zu bauen
2. Die Umgebungsvariablen werden aus Secrets geladen
3. Der Node.js-Server wird gestartet und stellt die Anwendung auf Port 5001 bereit

## Lokale Entwicklung vs. OpenShift-Deployment

Im Gegensatz zur lokalen Entwicklungsumgebung, wo Frontend und Backend getrennt laufen, werden in OpenShift beide Komponenten in einem einzigen Container bereitgestellt. Das Frontend wird während des Build-Prozesses kompiliert und als statische Dateien vom Backend-Server ausgeliefert.

## Wichtige Anpassungen für OpenShift

1. **Berechtigungen**: Die Dateien im Container müssen für die OpenShift-Benutzer zugänglich sein (`chgrp -R 0 /app && chmod -R g=u /app`)
2. **Umgebungsvariablen**: Werden aus OpenShift-Secrets geladen
3. **Ports**: Die Anwendung läuft auf Port 5001
4. **Node.js**: Wird entweder aus dem Basis-Image genutzt oder bei Bedarf installiert 