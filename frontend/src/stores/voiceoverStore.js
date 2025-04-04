import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useVoiceoverStore = defineStore('voiceover', () => {
  // API Base URL
  const apiBaseUrl = ref(import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001')
  
  // Languages and Voices
  const originalLanguage = ref('EN') // Back to English as default
  const targetLanguage = ref('')
  const scriptText = ref('')
  const activeLanguages = ref(['EN']) // Back to English as active language
  const selectedVoices = ref({ 'EN': 'Joanna' }) // Back to English default voice
  
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
  
  // Language Data
  const languages = ref({
    'EN': 'English',
    'DE': 'German',
    'FR': 'French',
    'ES': 'Spanish',
    'IT': 'Italian',
    'PL': 'Polish',
    'PT': 'Portuguese',
    'RU': 'Russian',
    'JA': 'Japanese',
    'ZH': 'Chinese',
    'AR': 'Arabic',
    'NL': 'Dutch',
    'CS': 'Czech',
    'DA': 'Danish',
    'FI': 'Finnish',
    'KO': 'Korean',
    'NB': 'Norwegian',
    'SV': 'Swedish',
    'TR': 'Turkish'
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
    // Filter out only the original language, not all active languages
    return Object.entries(languages.value)
      .filter(([code]) => code !== originalLanguage.value)
      .reduce((acc, [code, lang]) => {
        acc[code] = lang;
        return acc;
      }, {});
  })
  
  // Check if text has been entered
  const hasText = computed(() => {
    return scriptText.value.trim().length > 0;
  })
  
  // Methods for managing stepper status
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
  
  // Validation of steps
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
    
    // Text is available, mark the step as completed
    setStepComplete('text-input');
    
    // If no target language is selected, choose the first available language
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
  
  // Function to set cursor position
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
      const voicesToUse = {};
      
      // Stelle sicher, dass jede aktive Sprache eine Stimme hat
      for (const lang of activeLanguages.value) {
        if (voices.value[lang] && voices.value[lang].length > 0) {
          // Use the already selected voice or the first available one
          voicesToUse[lang] = selectedVoices.value[lang] || voices.value[lang][0];
        }
      }
      
      console.log('Generating voiceover with voices:', voicesToUse);
      console.log('Active languages:', activeLanguages.value);
      
      // Check if at least one voice is selected
      if (Object.keys(voicesToUse).length === 0) {
        errorMessage.value = 'Please select at least one voice.';
        alert(errorMessage.value);
        isLoading.value = false;
        return;
      }
      
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
        throw new Error(`HTTP Error: ${response.status}`);
      }
      
      const data = await response.json();
      const workerId = data.workerId;
      
      if (!workerId) {
        throw new Error('No worker ID received');
      }
      
      // Polling for worker status
      const checkProgress = async () => {
        try {
          const progressUrl = `${apiBaseUrl.value}/api/worker/${workerId}`;
          console.log('Prüfe Worker-Status:', progressUrl);
          
          const progressResponse = await fetch(progressUrl);
          if (!progressResponse.ok) {
            throw new Error(`HTTP error in worker status: ${progressResponse.status}`);
          }
          
          const workerStatus = await progressResponse.json();
          console.log('Worker-Status:', workerStatus);
          
          if (workerStatus.status === 'completed') {
            if (workerStatus.result && workerStatus.result.error) {
              errorMessage.value = `Error during generation: ${workerStatus.result.error}`;
              console.error(errorMessage.value);
              alert(errorMessage.value);
            } else if (workerStatus.result && workerStatus.result.download_file_name) {
              const downloadUrl = `${apiBaseUrl.value}/api/download/${workerStatus.result.download_file_name}`;
              downloadLink.value = downloadUrl;
              console.log('Download link:', downloadLink.value);
              
              // Automatic download
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
      errorMessage.value = `Error generating files: ${error.message}`;
      console.error(errorMessage.value, error);
      alert(errorMessage.value);
      isLoading.value = false;
    }
  }
  
  function triggerAutomaticDownload(url) {
    try {
      console.log('Starting automatic download from:', url);
      
      // Create an invisible a-element to start the download
      const downloadElement = document.createElement('a');
      downloadElement.href = url;
      downloadElement.download = 'voiceover_files.zip'; // Suggested filename
      downloadElement.target = '_blank'; // Open in new tab if inline download doesn't work
      downloadElement.rel = 'noopener noreferrer';
      downloadElement.style.display = 'none';
      
      // Add the element to the DOM
      document.body.appendChild(downloadElement);
      
      // Start the download
      downloadElement.click();
      
      // Remove the element after the click
      setTimeout(() => {
        document.body.removeChild(downloadElement);
      }, 1000);
      
      console.log('Automatic download started');
    } catch (error) {
      errorMessage.value = `Error during automatic download: ${error.message}`;
      console.error(errorMessage.value, error);
      // If automatic download fails, show a message
      alert('Automatic download could not be started. Please use the download link.');
    }
  }
  
  function clearForm() {
    scriptText.value = '';
    activeLanguages.value = [originalLanguage.value];
    selectedVoices.value = { [originalLanguage.value]: voices.value[originalLanguage.value][0] };
    downloadLink.value = null;
    errorMessage.value = '';
    
    // Reset all stepper steps
    for (const step in stepStatus.value) {
      stepStatus.value[step].complete = false;
      stepStatus.value[step].error = false;
    }
    
    console.log('Form and stepper status reset');
  }
  
  // Watches
  function updateOnLanguageChange() {
    // Ensure that the original language is included in the active languages
    // and remove all other languages, since when changing the original language
    // we only want to keep the new original language
    activeLanguages.value = [originalLanguage.value];
    
    // Ensure that a voice is selected for the original language
    if (!selectedVoices.value[originalLanguage.value] && voices.value[originalLanguage.value] && voices.value[originalLanguage.value].length > 0) {
      selectedVoices.value = { [originalLanguage.value]: voices.value[originalLanguage.value][0] };
    }
    
    console.log('Original language changed to:', originalLanguage.value);
    console.log('Active languages updated:', activeLanguages.value);
    console.log('Selected voices updated:', selectedVoices.value);
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
    
    // Stepper status methods
    setStepComplete,
    setStepError,
    resetStepStatus,
    validateTextInput,
    validateTranslation,
    validateVoiceSelection
  }
})
