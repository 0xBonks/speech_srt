# OpenShift Deployment für Speech SRT

Diese Anleitung beschreibt, wie du die Speech SRT Anwendung auf OpenShift deployen kannst.

## Voraussetzungen

- Zugang zu einer OpenShift-Umgebung
- OpenShift CLI (`oc`) installiert und eingerichtet
- Git-Repository mit dem Speech SRT Code

## Deployment-Schritte

### 1. Anmelden an OpenShift

```bash
oc login <cluster-url>
```

### 2. Projekt erstellen oder auswählen

```bash
oc new-project speech-srt
# oder
oc project <dein-projekt>
```

### 3. Secrets erstellen

1. Bearbeite die Datei `speech-srt-secrets.yaml` und füge deine tatsächlichen Zugangsdaten ein.
2. Erstelle das Secret:

```bash
oc apply -f openshift/speech-srt-secrets.yaml
```

### 4. Persistente Volumes erstellen

```bash
oc apply -f openshift/speech-srt-pvc.yaml
```

### 5. Image bauen

```bash
oc process -f openshift/image-build-template.yaml -p GIT_REPOSITORY_URL=<deine-repo-url> | oc apply -f -
oc start-build speech-srt
```

### 6. Deployment ausführen

```bash
oc apply -f openshift/speech-srt-deployment.yaml
```

### 7. Service und Route erstellen

```bash
oc apply -f openshift/speech-srt-service.yaml
oc apply -f openshift/speech-srt-route.yaml
```

### 8. URL der Anwendung abrufen

```bash
oc get route speech-srt -o jsonpath='{.spec.host}'
```

## Umgang mit Secrets

Bei OpenShift ist es wichtig, Secrets sicher zu verwalten. Hier sind einige Best Practices:

1. Füge keine tatsächlichen Zugangsdaten in die YAML-Dateien ein, die ins Git-Repository gepusht werden.
2. Nutze die OpenShift-Konsole, um Secrets zu erstellen oder zu bearbeiten.
3. Alternativ kannst du das Secret auch direkt über die Kommandozeile erstellen:

```bash
oc create secret generic speech-srt-secrets \
  --from-literal=POLLY_KEY_ID=dein_aws_access_key_id \
  --from-literal=POLLY_SECRET_KEY=dein_aws_secret_access_key \
  --from-literal=POLLY_REGION=eu-west-1 \
  --from-literal=TRANSLATOR_API_KEY_FREE_DEEPL=dein_deepl_api_key \
  --from-literal=TRANSLATOR_URL_FREE_DEEPL=https://api-free.deepl.com/v2/translate \
  --from-literal=IGNORE_TRANSLATOR_SSL_CERT=0
```

## Wartung und Monitoring

### Pod-Status prüfen

```bash
oc get pods -l app=speech-srt
```

### Logs anzeigen

```bash
oc logs -f deployment/speech-srt
```

### Deployment aktualisieren

Nach Änderungen an deinem Code:

```bash
oc start-build speech-srt
```

## Troubleshooting

### Pod startet nicht

```bash
oc describe pod <pod-name>
```

### Container crasht

```bash
oc logs <pod-name>
```

### Verbindung zu einem laufenden Pod

```bash
oc rsh <pod-name>
```