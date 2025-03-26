# OpenShift Serverless Deployment

Dieses Dokument beschreibt, wie die Anwendung mit OpenShift Serverless bereitgestellt werden kann.

## Voraussetzungen

- OpenShift-Cluster mit installiertem OpenShift Serverless
- `oc` CLI-Tool

## Dateien

- `func.yaml`: Konfiguration für die serverlose Funktion
- `openshift-function.yaml`: Konfiguration für den Serverless-Dienst
- `pvc.yaml`: Persistente Volumes für Datenspeicherung
- `package-func.json`: Vereinfachtes package.json für die Funktion

## Schritt 1: Erstellen der PersistentVolumeClaims

Zuerst erstellen wir die persistenten Volumes für Daten und temporäre Dateien:

```bash
oc apply -f pvc.yaml
```

## Schritt 2: Vorbereiten des Projekts für OpenShift Serverless

1. Kopieren Sie `package-func.json` als `package.json`:

```bash
cp package-func.json package.json
```

2. Bauen Sie das Frontend vor der Deployment:

```bash
npm install
npm run build
```

## Schritt 3: Deployment mit OpenShift Serverless

Sie haben zwei Optionen für das Deployment:

### Option 1: Verwenden der OpenShift Konsole

1. Navigieren Sie zur Web-Konsole
2. Wählen Sie das Projekt `t2s`
3. Gehen Sie zu "Add" > "Import YAML"
4. Fügen Sie den Inhalt von `openshift-function.yaml` ein
5. Klicken Sie auf "Create"

### Option 2: Verwenden der Kommandozeile

```bash
oc apply -f openshift-function.yaml
```

## Schritt 4: Konfiguration der Secrets

Stellen Sie sicher, dass alle erforderlichen Secrets im Namespace existieren:

```bash
oc create secret generic polly-key-id --from-literal=polly_key_id=YOUR_POLLY_KEY_ID
oc create secret generic polly-secret-key --from-literal=polly_secret_key=YOUR_POLLY_SECRET_KEY
oc create secret generic polly-region --from-literal=polly_region=YOUR_POLLY_REGION
oc create secret generic translator-key-free-deepl --from-literal=translator_key_free_deepl=YOUR_DEEPL_API_KEY
oc create secret generic translator-url-free-deepl --from-literal=translator_url_free_deepl=YOUR_DEEPL_URL
oc create secret generic ignore-translator-ssl-cert --from-literal=ignore_translator_ssl_cert=1
```

## Vorteile dieses Ansatzes

1. **Weniger Container-Konfiguration**: OpenShift Serverless abstrahiert viele der Docker-Komplexitäten
2. **Automatische Skalierung**: Basierend auf der Last wird die Anwendung hoch- oder herunterskaliert
3. **Ressourceneffizienz**: Keine Ressourcenverschwendung durch inaktive Container
4. **Einfachere Verwaltung**: Direkter Zugriff auf die Anwendung und ihre Logs über die OpenShift-Konsole

## Lokale Entwicklung vs. Serverless-Deployment

Der größte Unterschied zwischen der lokalen Entwicklung und dem Serverless-Deployment:

1. In der lokalen Entwicklung laufen Frontend und Backend getrennt
2. Im Serverless-Deployment wird das Frontend während des Builds kompiliert und vom Backend serviert

## Anmerkungen

- Der Port in OpenShift Serverless ist standardmäßig 8080
- Die Anwendung ist über die automatisch generierte Route erreichbar
- Die Volumes ermöglichen persistente Speicherung der erzeugten Dateien 