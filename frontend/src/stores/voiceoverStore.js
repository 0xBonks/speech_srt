import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVoiceoverStore = defineStore('voiceover', () => {
  // API-Basis-URL
  const apiBaseUrl = ref(import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001')
  
  // Sprachen und Stimmen
  const originalLanguage = ref('EN')
  const targetLanguage = ref('')
  const scriptText = ref('')
  const activeLanguages = ref(['EN'])
  const selectedVoices = ref({ 'EN': 'Joanna' })
  
  // Status
  const isLoading = ref(false)
  const downloadLink = ref(null)
  const errorMessage = ref('')
  
  // Stepper-Status
  const stepStatus = ref({
    'text-input': { complete: false, error: false },
    'translation': { complete: false, error: false },
    'select-voice': { complete: false, error: false },
    'audio-output': { complete: false, error: false }
  })
  
  // Sprachdaten
  const languages = ref({
    'DE': 'Deutsch',
    'EN': 'Englisch',
    'FR': 'Französisch',
    'ES': 'Spanisch',
    'IT': 'Italienisch',
    'PL': 'Polnisch',
    'PT': 'Portugiesisch',
    'RU': 'Russisch',
    'JA': 'Japanisch',
    'ZH': 'Chinesisch',
    'AR': 'Arabisch',
    'NL': 'Niederländisch',
    'CS': 'Tschechisch',
    'DA': 'Dänisch',
    'FI': 'Finnisch',
    'KO': 'Koreanisch',
    'NB': 'Norwegisch',
    'SV': 'Schwedisch',
    'TR': 'Türkisch'
  })
  
  const voices = ref({
    'EN': ['Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin', 'Matthew', 'Ruth', 'Stephen'],
    'DE': ['Daniel', 'Vicki'],
    'FR': ['Lea', 'Remi'],
    'ES': ['Lucia', 'Sergio'],
    'IT': ['Bianca', 'Adriano'],
    'PL': ['Ola'],
    'PT': ['Ines'],
    'RU': ['Maxim', 'Tatyana'],
    'JA': ['Kazuha', 'Takumi', 'Tomoko'],
    'ZH': ['Zhiyu'],
    'AR': ['Hala', 'Zayd'],
    'NL': ['Laura'],
    'CS': ['Jitka'],
    'DA': ['Sofie'],
    'FI': ['Suvi'],
    'KO': ['Seoyeon'],
    'NB': ['Ida'],
    'SV': ['Elin'],
    'TR': ['Burcu']
  })
  
  // Computed Properties
  const availableTargetLanguages = computed(() => {
    // Filtere nur die Originalsprache heraus, nicht alle aktiven Sprachen
    return Object.entries(languages.value)
      .filter(([code]) => code !== originalLanguage.value)
      .reduce((acc, [code, lang]) => {
        acc[code] = lang;
        return acc;
      }, {});
  })
  
  // Prüfen, ob Text eingegeben wurde
  const hasText = computed(() => {
    return scriptText.value.trim().length > 0;
  })
  
  // Methoden zum Verwalten des Stepper-Status
  function setStepComplete(stepName) {
    if (stepStatus.value[stepName]) {
      stepStatus.value[stepName].complete = true;
      stepStatus.value[stepName].error = false;
    }
  }
  
  function setStepError(stepName) {
    if (stepStatus.value[stepName]) {
      stepStatus.value[stepName].error = true;
      stepStatus.value[stepName].complete = false;
    }
  }
  
  function resetStepStatus(stepName) {
    if (stepStatus.value[stepName]) {
      stepStatus.value[stepName].complete = false;
      stepStatus.value[stepName].error = false;
    }
  }
  
  // Validierung der Schritte
  function validateTextInput() {
    if (!hasText.value) {
      setStepError('text-input');
      return false;
    }
    setStepComplete('text-input');
    return true;
  }
  
  function validateTranslation() {
    // Immer als gültig betrachten, auch wenn nur eine Sprache ausgewählt ist
    setStepComplete('translation');
    return true;
  }
  
  async function submitTextAndProceed() {
    if (!hasText.value) {
      setStepError('text-input');
      return false;
    }
    
    // Text ist vorhanden, markiere den Schritt als abgeschlossen
    setStepComplete('text-input');
    
    // Wenn keine Zielsprache ausgewählt ist, wähle die erste verfügbare Sprache
    if (!targetLanguage.value && Object.keys(availableTargetLanguages.value).length > 0) {
      targetLanguage.value = Object.keys(availableTargetLanguages.value)[0];
    }
    
    // Wenn eine Zielsprache ausgewählt ist, starte die Übersetzung
    if (targetLanguage.value && !activeLanguages.value.includes(targetLanguage.value)) {
      try {
        await addLanguage();
        return true;
      } catch (error) {
        console.error('Fehler bei der automatischen Übersetzung:', error);
        // Trotz Fehler als erfolgreich zurückgeben, damit die Navigation fortgesetzt wird
        return true;
      }
    }
    
    return true;
  }
  
  function validateVoiceSelection() {
    // Prüfen, ob für jede aktive Sprache eine Stimme ausgewählt wurde
    const allLanguagesHaveVoices = activeLanguages.value.every(lang => 
      selectedVoices.value[lang] && selectedVoices.value[lang].trim() !== ''
    );
    
    if (!allLanguagesHaveVoices) {
      setStepError('select-voice');
      return false;
    }
    
    setStepComplete('select-voice');
    return true;
  }
  
  // Methoden
  function getCursorPosition() {
    const textarea = document.getElementById('inputText');
    return textarea ? textarea.selectionStart : 0;
  }
  
  // Funktion zum Setzen der Cursorposition
  const cursorPosition = ref(0);
  function setCursorPosition(position) {
    // Speichere die Cursorposition in einer Variable
    cursorPosition.value = position;
  }
  
  function getLineByPos(text, position) {
    if (!text || position === undefined || position < 0) {
      return null;
    }
    
    const lines = text.split('\n');
    let currentPos = 0;
    
    for (const line of lines) {
      const lineLength = line.length + 1; // +1 für den Zeilenumbruch
      if (position >= currentPos && position < currentPos + lineLength) {
        return line;
      }
      currentPos += lineLength;
    }
    
    return null;
  }
  
  async function playLine() {
    try {
      errorMessage.value = '';
      const text = scriptText.value;
      // Verwende die gespeicherte cursorPosition statt getCursorPosition()
      const position = cursorPosition.value;
      const voices = selectedVoices.value;
      let langToPlay = originalLanguage.value;

      if (!text.trim()) {
        errorMessage.value = 'Bitte gib einen Text ein.';
        alert(errorMessage.value);
        return;
      }

      // Bestimme die Sprache an der Cursorposition
      if (text.includes('---')) {
        const line = getLineByPos(text, position);
        console.log("Aktuelle Zeile:", line);
        
        if (line) {
          const langMatch = line.match(/^#([A-Z]{2}):/);
          if (langMatch) {
            langToPlay = langMatch[1];
            console.log(`Erkannte Sprache an Cursor-Position: ${langToPlay}`);
          }
        }
      }
      
      // Wenn keine Stimme für diese Sprache ausgewählt ist, verwende die erste verfügbare
      if (!voices[langToPlay] && voices.value[langToPlay] && voices.value[langToPlay].length > 0) {
        voices[langToPlay] = voices.value[langToPlay][0];
      }

      console.log('Spiele Zeile ab in Sprache:', langToPlay, 'mit Stimme:', voices[langToPlay]);

      const response = await fetch(`${apiBaseUrl.value}/api/play-line`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text, 
          cursorPosition: position, 
          voices, 
          origLang: langToPlay // Verwende die erkannte Sprache
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const audio = new Audio(`${apiBaseUrl.value}/api/play/${data.file_name_mp3}`);
      audio.play();
    } catch (error) {
      errorMessage.value = `Fehler beim Abspielen der Zeile: ${error.message}`;
      console.error(errorMessage.value, error);
      alert(errorMessage.value);
    }
  }
  
  async function addLanguage() {
    try {
      errorMessage.value = '';
      if (!targetLanguage.value) {
        errorMessage.value = 'Bitte wähle eine Zielsprache aus.';
        alert(errorMessage.value);
        return;
      }
      
      if (!scriptText.value.trim()) {
        errorMessage.value = 'Bitte gib einen Text ein.';
        alert(errorMessage.value);
        return;
      }
      
      // Prüfe, ob die Zielsprache gleich der Originalsprache ist
      if (targetLanguage.value === originalLanguage.value) {
        errorMessage.value = 'Zielsprache darf nicht gleich der Originalsprache sein.';
        alert(errorMessage.value);
        return;
      }
      
      isLoading.value = true;
      let textToSend = scriptText.value;
      let origLang = originalLanguage.value;
      
      // Falls der Text bereits Übersetzungen enthält
      if (scriptText.value.includes('---')) {
        const parts = scriptText.value.split('---');
        const lines = parts[1].trim().split('\n');
        
        // Finde die Originalsprache
        for (const line of lines) {
          const match = line.match(/#([A-Z]{2}): (.*)/)
          if (match) {
            origLang = match[1];
            break;
          }
        }
        
        // Sende den kompletten Text mit allen Übersetzungen
        textToSend = scriptText.value;
      }
      
      console.log('Übersetze...', {
        textToSend: textToSend.substring(0, 50) + (textToSend.length > 50 ? '...' : ''),
        targetLang: targetLanguage.value,
        origLang: origLang
      });
      
      let responseData;
      try {
        const response = await fetch(`${apiBaseUrl.value}/api/add-translation`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: textToSend,
            targetLang: targetLanguage.value,
            origLang: origLang
          })
        });
        
        responseData = await response.json();
        
        if (!response.ok) {
          throw new Error(`HTTP-Fehler: ${response.status} - ${responseData.error || 'Unbekannter Fehler'}`);
        }
      } catch (error) {
        throw new Error(`Fehler beim API-Aufruf: ${error.message}`);
      }
      
      if (!responseData || !responseData.workerId) {
        throw new Error('Keine gültige Worker-ID vom Server erhalten');
      }
      
      const { workerId } = responseData;
      console.log('Übersetzungs-Worker gestartet:', workerId);
      
      const checkProgress = async () => {
        try {
          const progressUrl = `${apiBaseUrl.value}/api/worker/${workerId}`;
          console.log('Prüfe Worker-Status:', progressUrl);
          
          const progressResponse = await fetch(progressUrl);
          if (!progressResponse.ok) {
            const errorText = await progressResponse.text();
            throw new Error(`HTTP-Fehler bei Worker-Status: ${progressResponse.status} - ${errorText}`);
          }
          
          const workerStatus = await progressResponse.json();
          console.log('Worker-Status:', workerStatus);
          
          if (workerStatus.status === 'completed') {
            if (workerStatus.result && workerStatus.result.error) {
              errorMessage.value = `Fehler: ${workerStatus.result.error}`;
              console.error(errorMessage.value);
              alert(errorMessage.value);
              isLoading.value = false;
            } else if (workerStatus.result && workerStatus.result.text) {
              // Formatiere den Text für die Anzeige
              const translatedText = workerStatus.result.text;
              console.log('Übersetzungsergebnis:', translatedText);
              
              // Text aktualisieren
              scriptText.value = translatedText;
              
              // Extrahiere alle vorhandenen Sprachen aus dem übersetzten Text
              const lines = translatedText.split('\n');
              const languageCodes = [];
              
              for (const line of lines) {
                const match = line.match(/^#([A-Z]{2}):/);
                if (match && match[1]) {
                  const langCode = match[1];
                  if (!languageCodes.includes(langCode)) {
                    languageCodes.push(langCode);
                  }
                }
              }
              
              console.log('Erkannte Sprachen im übersetzten Text:', languageCodes);
              
              // Aktive Sprachen aktualisieren
              activeLanguages.value = languageCodes;
              
              // Stelle sicher, dass jede aktive Sprache eine Stimme hat
              for (const lang of activeLanguages.value) {
                if (!selectedVoices.value[lang] && voices.value[lang] && voices.value[lang].length > 0) {
                  selectedVoices.value[lang] = voices.value[lang][0];
                }
              }
              
              console.log('Übersetzung erfolgreich hinzugefügt!', {
                activeLanguages: activeLanguages.value,
                selectedVoices: selectedVoices.value
              });
            }
            isLoading.value = false;
          } else {
            // Noch nicht fertig, erneute Abfrage nach kurzer Wartezeit
            setTimeout(checkProgress, 500);
          }
        } catch (error) {
          errorMessage.value = `Fehler beim Prüfen des Worker-Status: ${error.message}`;
          console.error(errorMessage.value, error);
          isLoading.value = false;
        }
      };
      
      await checkProgress();
    } catch (error) {
      errorMessage.value = `Fehler beim Hinzufügen der Übersetzung: ${error.message}`;
      console.error(errorMessage.value, error);
      alert(errorMessage.value);
      isLoading.value = false;
    }
  }
  
  async function generateVoiceover() {
    try {
      errorMessage.value = '';
      if (!scriptText.value.trim()) {
        errorMessage.value = 'Bitte gib einen Text ein.';
        alert(errorMessage.value);
        return;
      }
      
      isLoading.value = true;
      const voicesToUse = { ...selectedVoices.value };
      
      // Stelle sicher, dass jede aktive Sprache eine Stimme hat
      for (const lang of activeLanguages.value) {
        if (!voicesToUse[lang] && voices.value[lang] && voices.value[lang].length > 0) {
          voicesToUse[lang] = voices.value[lang][0];
        }
      }
      
      console.log('Generiere Dateien mit Stimmen:', voicesToUse);
      
      const response = await fetch(`${apiBaseUrl.value}/api/make-files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: scriptText.value,
          voices: voicesToUse,
          origLang: originalLanguage.value
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP-Fehler: ${response.status} - ${errorData.error || 'Unbekannter Fehler'}`);
      }
      
      const { workerId } = await response.json();
      console.log('Worker ID:', workerId);
      
      const checkProgress = async () => {
        try {
          const progressUrl = `${apiBaseUrl.value}/api/worker/${workerId}`;
          console.log('Prüfe Worker-Status:', progressUrl);
          
          const progressResponse = await fetch(progressUrl);
          if (!progressResponse.ok) {
            throw new Error(`HTTP-Fehler bei Worker-Status: ${progressResponse.status}`);
          }
          
          const workerStatus = await progressResponse.json();
          console.log('Worker-Status:', workerStatus);
          
          if (workerStatus.status === 'completed') {
            if (workerStatus.result && workerStatus.result.error) {
              errorMessage.value = `Fehler: ${workerStatus.result.error}`;
              console.error(errorMessage.value);
              alert(errorMessage.value);
            } else if (workerStatus.result && workerStatus.result.download_file_name) {
              const downloadUrl = `${apiBaseUrl.value}/api/download/${workerStatus.result.download_file_name}`;
              downloadLink.value = downloadUrl;
              console.log('Download-Link:', downloadLink.value);
              
              // Automatischer Download
              triggerAutomaticDownload(downloadUrl);
            }
            isLoading.value = false;
          } else {
            // Noch nicht fertig, erneute Abfrage nach kurzer Wartezeit
            setTimeout(checkProgress, 500);
          }
        } catch (error) {
          errorMessage.value = `Fehler beim Prüfen des Worker-Status: ${error.message}`;
          console.error(errorMessage.value, error);
          isLoading.value = false;
        }
      };
      
      await checkProgress();
    } catch (error) {
      errorMessage.value = `Fehler beim Generieren der Dateien: ${error.message}`;
      console.error(errorMessage.value, error);
      alert(errorMessage.value);
      isLoading.value = false;
    }
  }
  
  function triggerAutomaticDownload(url) {
    try {
      console.log('Starte automatischen Download von:', url);
      
      // Erstelle ein unsichtbares a-Element zum Starten des Downloads
      const downloadElement = document.createElement('a');
      downloadElement.href = url;
      downloadElement.download = 'voiceover_files.zip'; // Vorgeschlagener Dateiname
      downloadElement.target = '_blank'; // Öffne in neuem Tab, falls inline-Download nicht funktioniert
      downloadElement.rel = 'noopener noreferrer';
      downloadElement.style.display = 'none';
      
      // Füge das Element zum DOM hinzu
      document.body.appendChild(downloadElement);
      
      // Starte den Download
      downloadElement.click();
      
      // Entferne das Element nach dem Klick
      setTimeout(() => {
        document.body.removeChild(downloadElement);
      }, 1000);
      
      console.log('Automatischer Download gestartet');
    } catch (error) {
      errorMessage.value = `Fehler beim automatischen Download: ${error.message}`;
      console.error(errorMessage.value, error);
      // Falls der automatische Download fehlschlägt, zeige eine Nachricht an
      alert('Automatischer Download konnte nicht gestartet werden. Bitte nutzen Sie den Download-Link.');
    }
  }
  
  function clearForm() {
    scriptText.value = '';
    activeLanguages.value = [originalLanguage.value];
    selectedVoices.value = { [originalLanguage.value]: voices.value[originalLanguage.value][0] };
    downloadLink.value = null;
    errorMessage.value = '';
    
    // Setze alle Stepper-Schritte zurück
    for (const step in stepStatus.value) {
      stepStatus.value[step].complete = false;
      stepStatus.value[step].error = false;
    }
    
    console.log('Formular und Stepper-Status zurückgesetzt');
  }
  
  // Watches
  function updateOnLanguageChange() {
    // Stelle sicher, dass die Originalsprache in den aktiven Sprachen enthalten ist,
    // aber behalte alle anderen aktiven Sprachen bei
    if (!activeLanguages.value.includes(originalLanguage.value)) {
      activeLanguages.value = [originalLanguage.value, ...activeLanguages.value];
    }
    
    // Stelle sicher, dass für die Originalsprache eine Stimme ausgewählt ist
    if (!selectedVoices.value[originalLanguage.value] && voices.value[originalLanguage.value] && voices.value[originalLanguage.value].length > 0) {
      selectedVoices.value[originalLanguage.value] = voices.value[originalLanguage.value][0];
    }
    
    // Behalte den Text bei - lösche ihn nicht
    // downloadLink.value = null;
    // errorMessage.value = '';
  }
  
  return {
    // State
    apiBaseUrl,
    originalLanguage,
    targetLanguage,
    scriptText,
    activeLanguages,
    selectedVoices,
    isLoading,
    downloadLink,
    errorMessage,
    languages,
    voices,
    stepStatus,
    cursorPosition,
    
    // Computed
    availableTargetLanguages,
    hasText,
    
    // Methoden
    getCursorPosition,
    setCursorPosition,
    getLineByPos,
    playLine,
    addLanguage,
    generateVoiceover,
    triggerAutomaticDownload,
    clearForm,
    updateOnLanguageChange,
    submitTextAndProceed,
    
    // Stepper-Status-Methoden
    setStepComplete,
    setStepError,
    resetStepStatus,
    validateTextInput,
    validateTranslation,
    validateVoiceSelection
  }
})
