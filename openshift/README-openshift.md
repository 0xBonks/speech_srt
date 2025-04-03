# Speech SRT OpenShift Deployment

Diese Anleitung beschreibt, wie du die Speech SRT Anwendung auf OpenShift deployen kannst. Die Konfiguration ist speziell für das bestehende Projekt `t2s` angepasst.

## Voraussetzungen

- Zugang zur OpenShift-Umgebung
- Bestehendes Projekt `t2s`
- Bestehende Secrets `polly-engine` und `deepl-translator`
- Bestehendes PVC `temp`
- Git-Zugriff über das `hicp` Secret

## Deployment-Schritte

### 1. BuildConfig und ImageStream erstellen

```bash
oc apply -f openshift/speech-srt-buildconfig.yaml
```

### 2. Deployment, Service und Route erstellen

```bash
oc apply -f openshift/speech-srt-deployment.yaml
oc apply -f openshift/speech-srt-service.yaml
oc apply -f openshift/speech-srt-route.yaml
```

### 3. Build starten

```bash
oc start-build text2speech-git
```

## Konfigurationsdetails

### Image-Build

Die BuildConfig verwendet:
- Name: `text2speech-git`
- Namespace: `t2s`
- Git-Repository: `https://gitlab.intra.infineon.com/bauersachs/speech_srt.git`
- Git-Zugriffsgeheimnis: `hicp`
- Dockerfile-Strategie statt Python
- Verschiedene Webhook-Trigger

### Deployment

Das Deployment verwendet:
- Bestehendes PVC `temp`, gemountet unter `/app`
- Umgebungsvariablen für Temp-Pfade:
  - `TEMP_FILE_FOLDER=/app/output`
  - `TEMP_PLAY_FOLDER=/app/static/temp`
- Secrets `polly-engine` und `deepl-translator` für AWS und DeepL Zugangsdaten

### Struktur der YAML-Dateien

- `speech-srt-buildconfig.yaml`: BuildConfig und ImageStream
- `speech-srt-deployment.yaml`: Deployment-Konfiguration
- `speech-srt-service.yaml`: Service für internen Netzwerkzugriff
- `speech-srt-route.yaml`: Route für externen Zugriff

## Interne OpenShift-Bildverwendung

Die Anwendung verwendet das interne OpenShift-Image:
```
image-registry.openshift-image-registry.svc:5000/t2s/text2speech-git:latest
```

## Troubleshooting

### Pod startet nicht

```bash
oc describe pod -l app=text2speech-git
```

### Container crasht

```bash
oc logs -f deployment/text2speech-git
```

### Build fehlgeschlagen

```bash
oc logs -f bc/text2speech-git
``` 