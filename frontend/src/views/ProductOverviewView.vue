<template>
  <div class="product-overview-view">
    <h1>Multilingual Voiceover Assistant</h1>
    <p>With Explore the Multilingual Voiceover Assistant, a tool designed to help you create high-quality voiceovers and subtitles for internal videos and screencasts. Leveraging advanced textto-speech technology, it produces natural-sounding voices that perfectly match your subtitles. with synchronized SRT files for easy integration into videos.</p>
    <p><strong>Features:</strong></p>
    <p>Translation, Text-to-Speech- Conversion (mp3), Caption file creation (srt)</p>

    <div class="product-info">
      <div class="section">
        <h2>Status</h2>
        <div class="button-group">
          <ifx-button @click="checkStatus">Status prüfen</ifx-button>
          <ifx-button @click="testPolly">AWS Polly testen</ifx-button>
          <ifx-button @click="testTranslator">Übersetzer testen</ifx-button>
        </div>
        <pre class="status-result">{{ statusResult }}</pre>
      </div>

      <div class="section">
        <h2>Text zu Sprache</h2>
        <ifx-textarea 
          ref="inputTextArea"
          v-model="inputText" 
          placeholder="Text eingeben..." 
          rows="6"
          @click="updateCursorPosition"
          @keyup="updateCursorPosition"
          @select="updateCursorPosition"
        ></ifx-textarea>
        
        <div class="controls">
          <div class="select-group">
            <label>Sprache:</label>
            <ifx-dropdown placement="bottom-start" no-close-on-menu-click="true">
              <ifx-dropdown-trigger-button>
                {{ languageNames[selectedLanguage] || 'Sprache wählen' }}
              </ifx-dropdown-trigger-button>
              <ifx-dropdown-menu size="l">
                <ifx-dropdown-header>Sprache auswählen</ifx-dropdown-header>
                <ifx-dropdown-item 
                  v-for="(name, code) in languageNames" 
                  :key="code"
                  @click="selectLanguage(code)"
                >
                  {{ name }} ({{ code }})
                </ifx-dropdown-item>
              </ifx-dropdown-menu>
            </ifx-dropdown>

            <label>Stimme:</label>
            <ifx-dropdown placement="bottom-start" no-close-on-menu-click="true">
              <ifx-dropdown-trigger-button>
                {{ selectedVoice || 'Stimme wählen' }}
              </ifx-dropdown-trigger-button>
              <ifx-dropdown-menu size="l">
                <ifx-dropdown-header>Stimme auswählen</ifx-dropdown-header>
                <ifx-dropdown-item 
                  v-for="voice in availableVoices" 
                  :key="voice"
                  @click="selectVoice(voice)"
                >
                  {{ voice }}
                </ifx-dropdown-item>
              </ifx-dropdown-menu>
            </ifx-dropdown>
          </div>
        </div>

        <div class="button-group">
          <ifx-button @click="playLine">Zeile abspielen</ifx-button>
          <ifx-button @click="makeFiles">MP3/SRT erstellen</ifx-button>
          <ifx-button @click="addTranslation">Übersetzung hinzufügen</ifx-button>
          <ifx-button @click="clearText">Text löschen</ifx-button>
        </div>

        <div v-if="showResult" class="result">{{ resultMessage }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// API Basis-URL
const API_BASE_URL = 'http://localhost:5000/api';

// Reactive state
const inputText = ref('Dies ist ein Test.');
const selectedLanguage = ref('DE');
const selectedVoice = ref('');
const statusResult = ref('');
const resultMessage = ref('');
const showResult = ref(false);
const availableVoices = ref([]);
const cursorPosition = ref(0);
const inputTextArea = ref(null);

// Verfügbare Stimmen pro Sprache
const voices = {
  "EN": ['Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
         'Matthew', 'Ruth', 'Stephen'],
  "DE": ["Daniel", "Vicki"],
  "FR": ["Lea", "Remi"],
  "ES": ["Lucia", "Sergio"],
  "IT": ["Bianca", "Adriano"],
  "PL": ["Ola"],
  "PT": ["Ines"],
  "RU": ["Maxim", "Tatyana"],
  "JA": ["Kazuha", "Takumi", "Tomoko"],
  "ZH": ["Zhiyu"],
  "AR": ["Hala", "Zayd"],
  "NL": ["Laura"],
  "CS": ["Jitka"],
  "DA": ["Sofie"],
  "FI": ["Suvi"],
  "KO": ["Seoyeon"],
  "NB": ["Ida"],
  "SV": ["Elin"],
  "TR": ["Burcu"]
};

// Sprach-Namen
const languageNames = {
  'DE': 'Deutsch',
  'EN': 'English',
  'FR': 'Français',
  'ES': 'Español',
  'IT': 'Italiano',
  'PL': 'Polski',
  'PT': 'Português',
  'RU': 'Русский',
  'JA': '日本語',
  'ZH': '中文',
  'AR': 'العربية',
  'NL': 'Nederlands',
  'CS': 'Čeština',
  'DA': 'Dansk',
  'FI': 'Suomi',
  'KO': '한국어',
  'NB': 'Norsk',
  'SV': 'Svenska',
  'TR': 'Türkçe'
};

// Methods
const selectLanguage = (code) => {
  selectedLanguage.value = code;
  updateVoices();
};

const selectVoice = (voice) => {
  selectedVoice.value = voice;
};

const updateVoices = () => {
  availableVoices.value = voices[selectedLanguage.value] || [];
  if (availableVoices.value.length > 0 && !selectedVoice.value) {
    selectedVoice.value = availableVoices.value[0];
  }
};

const showMessage = (message) => {
  resultMessage.value = message;
  showResult.value = true;
  setTimeout(() => {
    showResult.value = false;
  }, 3000);
};

const updateCursorPosition = () => {
  // Get the actual textarea element from the ifx-textarea
  const textarea = inputTextArea.value?.$el?.querySelector('textarea');
  if (textarea) {
    cursorPosition.value = textarea.selectionStart;
    console.log('Cursor position updated:', cursorPosition.value);
  }
};

const checkStatus = async () => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/status`);
    statusResult.value = JSON.stringify(data, null, 2);
  } catch (error) {
    statusResult.value = `Fehler: ${error.message}`;
  }
};

const testPolly = async () => {
  try {
    statusResult.value = "Teste AWS Polly Verbindung...";
    const { data } = await axios.post(`${API_BASE_URL}/test-polly`);
    statusResult.value = `AWS Polly Test: ${JSON.stringify(data, null, 2)}`;
  } catch (error) {
    statusResult.value = `Fehler: ${error.message}`;
  }
};

const testTranslator = async () => {
  try {
    statusResult.value = "Teste Übersetzer Verbindung...";
    const { data } = await axios.post(`${API_BASE_URL}/test-translator`);
    statusResult.value = `Übersetzer Test: ${JSON.stringify(data, null, 2)}`;
  } catch (error) {
    statusResult.value = `Fehler: ${error.message}`;
  }
};

const getLineByPos = (text, pos) => {
  const lines = text.split('\n');
  let currentPos = 0;
  
  for (const line of lines) {
    if (currentPos <= pos && currentPos + line.length >= pos) {
      return line;
    }
    currentPos += line.length + 1; // +1 für das '\n' Zeichen
  }
  
  return null;
};

const extractTranslationsForLine = (text, selectedLine, cursorPosition) => {
  const translations = {};
  const lines = text.split('\n');
  let blockStart = -1;
  let currentPos = 0;
  
  // Finde den relevanten Übersetzungsblock
  for (let i = 0; i < lines.length; i++) {
    currentPos += lines[i].length + 1;
    if (currentPos > cursorPosition) {
      // Gehe zurück bis zum letzten "---"
      for (let j = i; j >= 0; j--) {
        if (lines[j].trim() === '---') {
          blockStart = j;
          break;
        }
      }
      break;
    }
  }
  
  if (blockStart === -1) {
    // Wenn kein Block gefunden wurde, nimm den Text als Deutsch
    translations['DE'] = selectedLine.trim();
    return translations;
  }
  
  // Extrahiere alle Übersetzungen aus dem Block
  for (let i = blockStart + 1; i < lines.length && lines[i].trim() !== '---'; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const match = line.match(/^#([A-Z]{2}): (.+)$/);
    if (match) {
      const [_, lang, text] = match;
      translations[lang] = text.trim();
    } else if (line !== '---') {
      // Text ohne Sprachpräfix ist Deutsch
      translations['DE'] = line;
    }
  }
  
  return translations;
};

const playLine = async () => {
  try {
    const text = inputText.value;
    
    // Prüfen ob das Textfeld leer ist
    if (!text.trim()) {
      showMessage('Fehler: Das Textfeld ist leer. Bitte geben Sie Text ein.');
      return;
    }
    
    const selectedLine = getLineByPos(text, cursorPosition.value);
    if (!selectedLine) {
      showMessage('Keine Zeile an der Cursor-Position gefunden');
      return;
    }

    showMessage('Bereite Audio vor...');
    console.log('Selected line:', selectedLine);

    // Extrahiere alle Übersetzungen für die aktuelle Zeile
    const translations = extractTranslationsForLine(text, selectedLine, cursorPosition.value);
    console.log('Found translations:', translations);
    
    // Wenn Übersetzungen verfügbar sind, zeige Sprachauswahl-Dialog
    if (Object.keys(translations).length > 0) {
      const result = await showLanguageSelectionDialog(translations);
      if (!result) return; // Benutzer hat abgebrochen
      
      const textToPlay = result.text;
      const langToPlay = result.lang;
      const voiceToUse = voices[langToPlay]?.[0] || '';
      
      if (!voiceToUse) {
        showMessage(`Keine Stimme für Sprache ${langToPlay} verfügbar`);
        return;
      }

      console.log(`Playing ${langToPlay} translation: "${textToPlay}"`);
      showMessage(`Bereite Audio vor (${languageNames[langToPlay]})...`);

      const { data } = await axios.post(`${API_BASE_URL}/play-line`, {
        text: textToPlay,
        cursorPosition: 0,
        voices: { [langToPlay]: voiceToUse },
        origLang: langToPlay
      });

      if (data.error) {
        throw new Error(data.error);
      }

      const audio = new Audio(`${API_BASE_URL}/play/${data.file_name_mp3}`);
      
      audio.onerror = (e) => {
        console.error('Audio error:', e);
        showMessage('Fehler beim Abspielen des Audios');
      };
      
      audio.onplay = () => {
        console.log('Audio playback started');
        showMessage(`Audio wird abgespielt (${languageNames[langToPlay]})...`);
      };
      
      audio.onended = () => {
        console.log('Audio playback completed');
        showMessage(`Audio-Wiedergabe beendet (${languageNames[langToPlay]})`);
      };
      
      await audio.play();
    } else {
      // Keine Übersetzungen gefunden, spiele Originaltext
      const langToPlay = 'DE';
      const voiceToUse = voices[langToPlay][0];
      
      console.log(`Playing original text in ${langToPlay}: "${selectedLine}"`);
      showMessage(`Bereite Audio vor (${languageNames[langToPlay]})...`);

      const { data } = await axios.post(`${API_BASE_URL}/play-line`, {
        text: selectedLine,
        cursorPosition: 0,
        voices: { [langToPlay]: voiceToUse },
        origLang: langToPlay
      });

      if (data.error) {
        throw new Error(data.error);
      }

      const audio = new Audio(`${API_BASE_URL}/play/${data.file_name_mp3}`);
      await audio.play();
      showMessage(`Audio wird abgespielt (${languageNames[langToPlay]})...`);
    }
  } catch (error) {
    console.error('Error in playLine function:', error);
    showMessage(`Fehler: ${error.message}`);
  }
};

const showLanguageSelectionDialog = (translations) => {
  return new Promise((resolve) => {
    const dialog = document.createElement('div');
    dialog.style.position = 'fixed';
    dialog.style.top = '50%';
    dialog.style.left = '50%';
    dialog.style.transform = 'translate(-50%, -50%)';
    dialog.style.backgroundColor = 'white';
    dialog.style.padding = '20px';
    dialog.style.border = '1px solid #ccc';
    dialog.style.borderRadius = '5px';
    dialog.style.zIndex = '1000';
    dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    dialog.style.minWidth = '300px';
    
    dialog.innerHTML = `
      <h3 style="margin-top: 0">Sprache zum Abspielen wählen</h3>
      <div style="margin-bottom: 15px">
        ${Object.entries(translations).map(([lang, text]) => `
          <div style="margin: 10px 0">
            <button class="lang-select" data-lang="${lang}" style="width: 100%; padding: 8px; margin: 2px 0">
              ${languageNames[lang]} (${lang})
            </button>
          </div>
        `).join('')}
      </div>
      <button id="cancelLangSelect" style="width: 100%; padding: 8px">Abbrechen</button>
    `;
    
    // Overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.right = '0';
    overlay.style.bottom = '0';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';
    
    document.body.appendChild(overlay);
    document.body.appendChild(dialog);
    
    // Event-Handler
    dialog.querySelectorAll('.lang-select').forEach(button => {
      button.addEventListener('click', () => {
        const lang = button.dataset.lang;
        document.body.removeChild(dialog);
        document.body.removeChild(overlay);
        resolve({ lang, text: translations[lang] });
      });
    });
    
    document.getElementById('cancelLangSelect').addEventListener('click', () => {
      document.body.removeChild(dialog);
      document.body.removeChild(overlay);
      resolve(null);
    });
  });
};

const makeFiles = async () => {
  if (!inputText.value.trim()) {
    showMessage('Fehler: Das Textfeld ist leer.');
    return;
  }

  try {
    showMessage('Starte Verarbeitung...');

    // Erstelle das voices-Objekt mit allen verfügbaren Stimmen
    const allVoices = {};
    for (const lang in voices) {
      // Verwende die erste Stimme für jede Sprache
      allVoices[lang] = voices[lang][0];
    }

    // Überschreibe mit der ausgewählten Stimme für die aktuelle Sprache
    if (selectedVoice.value) {
      allVoices[selectedLanguage.value] = selectedVoice.value;
    }

    // Wenn der Text keine Übersetzungen enthält (kein '---'), füge Sprachpräfix hinzu
    let processedText = inputText.value;
    if (!processedText.includes('---')) {
      processedText = `---\n#${selectedLanguage.value}: ${processedText}`;
    }

    console.log('Making files with:', {
      voices: allVoices,
      origLang: selectedLanguage.value,
      textHasTranslations: processedText.includes('---'),
      text: processedText
    });

    const { data } = await axios.post(`${API_BASE_URL}/make-files`, {
      text: processedText,
      voices: allVoices,
      origLang: selectedLanguage.value
    });

    if (!data.workerId) {
      throw new Error('Keine Worker-ID vom Server erhalten');
    }

    console.log('Started worker:', data.workerId);
    await checkWorkerProgress(data.workerId);
  } catch (error) {
    console.error('Error in makeFiles:', error);
    showMessage(`Fehler: ${error.message}`);
  }
};

const checkWorkerProgress = async (workerId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/worker/${workerId}`);
    console.log('Worker status:', data);

    if (data.status === 'completed') {
      if (data.result?.error) {
        showMessage(`Fehler: ${data.result.error}`);
      } else if (data.result?.download_file_name) {
        showMessage('Verarbeitung abgeschlossen! Dateien werden heruntergeladen...');
        // Kurze Verzögerung für die Nachricht
        await new Promise(resolve => setTimeout(resolve, 1000));
        const downloadUrl = `${API_BASE_URL}/download/${data.result.download_file_name}`;
        console.log('Download URL:', downloadUrl);
        
        // Erstelle einen unsichtbaren Link und klicke ihn an
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = 'speech_files.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showMessage('Verarbeitung abgeschlossen, aber keine Download-URL erhalten');
      }
      return;
    } else if (data.status === 'failed') {
      showMessage(`Fehler bei der Verarbeitung: ${data.error || 'Unbekannter Fehler'}`);
      return;
    }

    showMessage(`${data.stage || 'Verarbeite'} (${Math.round(data.progress || 0)}%)`);
    setTimeout(() => checkWorkerProgress(workerId), 500);
  } catch (error) {
    console.error('Error checking worker progress:', error);
    showMessage(`Fehler beim Prüfen des Fortschritts: ${error.message}`);
  }
};

const addTranslation = async () => {
  if (!inputText.value.trim()) {
    showMessage('Fehler: Das Textfeld ist leer.');
    return;
  }

  try {
    const { data } = await axios.post(`${API_BASE_URL}/add-translation`, {
      text: inputText.value,
      targetLang: selectedLanguage.value,
      origLang: 'DE'
    });

    checkTranslationProgress(data.workerId);
  } catch (error) {
    showMessage(`Fehler: ${error.message}`);
  }
};

const checkTranslationProgress = async (workerId) => {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/worker/${workerId}`);

    if (data.status === 'completed') {
      if (data.result?.error) {
        showMessage(`Fehler: ${data.result.error}`);
      } else if (data.result?.text) {
        inputText.value = data.result.text;
        showMessage('Übersetzung hinzugefügt!');
      }
      return;
    }

    showMessage(`${data.stage} (${Math.round(data.progress)}%)`);
    setTimeout(() => checkTranslationProgress(workerId), 500);
  } catch (error) {
    showMessage(`Fehler: ${error.message}`);
  }
};

const clearText = () => {
  inputText.value = '';
  showMessage('Text gelöscht');
};

// Initialize on component mount
onMounted(() => {
  updateVoices();
});
</script>

<style scoped>
.product-overview-view {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-info {
  margin-top: 20px;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
}

.button-group {
  margin: 10px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.controls {
  margin: 15px 0;
}

.select-group {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
}

.result {
  margin-top: 10px;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
}

.status-result {
  white-space: pre-wrap;
  font-family: monospace;
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

label {
  font-weight: bold;
  min-width: 80px;
}
</style>