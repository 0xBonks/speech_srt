#!/bin/bash

# Farben für Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}OpenShift Serverless Deployment für Speech-SRT${NC}"
echo "---------------------------------------"

# Prüfe ob oc installiert ist
if ! command -v oc &> /dev/null; then
    echo -e "${RED}oc nicht gefunden. Bitte OpenShift CLI installieren.${NC}"
    exit 1
fi

# Prüfe ob eingeloggt
if ! oc whoami &> /dev/null; then
    echo -e "${RED}Nicht in OpenShift eingeloggt. Bitte zuerst einloggen mit:${NC}"
    echo "oc login https://openshift-url.com"
    exit 1
fi

# Projekt auswählen
echo -e "${YELLOW}Wechsle zum t2s Projekt...${NC}"
oc project t2s || { 
    echo -e "${RED}Fehler beim Wechseln zum Projekt t2s${NC}"
    exit 1
}

# Build Frontend
echo -e "${YELLOW}Baue Frontend...${NC}"
if [ ! -f "package-func.json" ]; then
    echo -e "${RED}package-func.json nicht gefunden.${NC}"
    exit 1
fi

cp package-func.json package.json
npm install || { 
    echo -e "${RED}NPM Install fehlgeschlagen${NC}"
    exit 1
}

npm run build || { 
    echo -e "${RED}Frontend Build fehlgeschlagen${NC}"
    exit 1
}

# PVC erstellen
echo -e "${YELLOW}Erstelle Persistent Volume Claims...${NC}"
oc apply -f pvc.yaml || {
    echo -e "${RED}Fehler beim Erstellen der PVCs${NC}"
    exit 1
}

# Serverless Function deployen
echo -e "${YELLOW}Deploye OpenShift Serverless Function...${NC}"
oc apply -f openshift-function.yaml || {
    echo -e "${RED}Fehler beim Deployen der Serverless Function${NC}"
    exit 1
}

# Route anzeigen
echo -e "${YELLOW}Hole Route-Information...${NC}"
ROUTE=$(oc get route speech-srt -o jsonpath='{.spec.host}')

if [ -n "$ROUTE" ]; then
    echo -e "${GREEN}Deployment erfolgreich!${NC}"
    echo -e "Die Anwendung ist erreichbar unter: ${GREEN}https://$ROUTE${NC}"
else
    echo -e "${YELLOW}Route noch nicht verfügbar. Prüfe später mit:${NC}"
    echo "oc get route speech-srt"
fi

echo -e "${YELLOW}Prüfe Logs mit:${NC}"
echo "oc logs -f deployment/speech-srt" 