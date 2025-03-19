<template>
  <div class="voiceover-assistant">
    <div class="container">
      <div class="header">
        <h1>Multilingual Voiceover Assistant</h1>
        <p class="description">
          With Explore the Multilingual Voiceover Assistant, a tool designed to help you create high-quality voiceovers and subtitles for internal videos and screencasts. Leveraging advanced text-to-speech technology, it produces natural-sounding voices that perfectly match your subtitles, with synchronized SRT files for easy integration into videos.
        </p>
        <div class="features">
          <p><strong>Features:</strong></p>
          <p>Translation, Text-to-Speech: Conversion (mp3), Caption file creation (srt)</p>
        </div>
      </div>

      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
        <span class="close-error" @click="errorMessage = ''">&times;</span>
      </div>

      <div class="main-content">
        <div class="column left-column">
          <h2>Translation</h2>
          
          <div class="language-selection-row">
            <div class="language-selection-item">
              <label>Select the original language of the text</label>
              <div class="select-wrapper">
                <select v-model="originalLanguage">
                  <option v-for="(lang, code) in languages" :key="code" :value="code">{{ lang }}</option>
                </select>
              </div>
            </div>
            
            <div class="language-selection-item">
              <label>Translate</label>
              <div class="select-wrapper">
                <select v-model="targetLanguage">
                  <option value="">Choose language to add</option>
                  <option v-for="(lang, code) in availableTargetLanguages" :key="code" :value="code">
                    {{ lang }}
                  </option>
                </select>
              </div>
              <button class="add-language-btn" @click="addLanguage" :disabled="!targetLanguage || isLoading">
                {{ isLoading ? 'Adding...' : 'ADD LANGUAGE' }}
              </button>
            </div>
          </div>
          
          <div class="input-group">
            <label>Enter the script text here</label>
            <textarea v-model="scriptText" rows="18" id="inputText"></textarea>
          </div>
          
          <div class="button-group">
            <button class="play-btn" @click="playLine">Play current file (Alt-P)</button>
            <button class="clear-btn" @click="clearForm">CLICK HERE TO CLEAR THE FORM</button>
          </div>
        </div>
        
        <div class="column right-column">
          <h2>Select voice</h2>
          <p>Select a voice for each language (from the Amazon Web Service catalog.)</p>
          
          <div class="voice-selection">
            <div v-for="lang in activeLanguages" :key="lang" class="voice-option">
              <label>{{ languages[lang] }} ({{ lang }})</label>
              <div class="select-wrapper">
                <select v-model="selectedVoices[lang]">
                  <option v-for="voice in voices[lang]" :key="voice" :value="voice">{{ voice }}</option>
                </select>
              </div>
            </div>
          </div>
          
          <h2>Generate output</h2>
          <button class="generate-btn" @click="generateVoiceover" :disabled="isLoading">
            {{ isLoading ? 'Generating...' : 'MAKE VOICEOVER AND SUBTITLES' }}
          </button>
          
          <div v-if="downloadLink" class="download-link">
            <a :href="downloadLink" download>Download your files</a>
          </div>
          
          <div class="disclaimer">
            <h2>Disclaimer</h2>
            <p>AWS Services are subject to certain restrictions. Specifically, they should not be used with export-controlled technical data, such as:</p>
            
            <ol>
              <li>
                Detailed technical information related to military or dual-use products, including
                <ul>
                  <li>Crypto Box</li>
                  <li>RedHat</li>
                  <li>GaN EPI</li>
                  <li>SiC EPI</li>
                </ul>
              </li>
              <li>
                Files like GDS-II, RTL, and layout data, or descriptions of these products.
              </li>
            </ol>
            
            <p>
              If you have any questions or concerns about using the Voiceover Assistant with specific data, please don't hesitate to reach out to your local 
              <a href="#" class="link">Export Agent</a>, 
              <a href="#" class="link">Export Control Officer</a>, or the relevant Competence Center for guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceoverAssistant',
  data() {
    return {
      apiBaseUrl: import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5001',
      originalLanguage: 'DE',
      targetLanguage: '',
      scriptText: '',
      activeLanguages: ['DE'],
      selectedVoices: { 'DE': 'Daniel' },
      isLoading: false,
      downloadLink: null,
      errorMessage: '',
      languages: {
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
      },
      voices: {
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
      }
    };
  },
  computed: {
    availableTargetLanguages() {
      return Object.entries(this.languages)
        .filter(([code]) => !this.activeLanguages.includes(code))
        .reduce((acc, [code, lang]) => {
          acc[code] = lang;
          return acc;
        }, {});
    }
  },
  methods: {
    async playLine() {
      try {
        this.errorMessage = '';
        const text = this.scriptText;
        const cursorPosition = this.getCursorPosition();
        const voices = this.selectedVoices;
        let langToPlay = this.originalLanguage;

        if (!text.trim()) {
          this.errorMessage = 'Bitte gib einen Text ein.';
          alert(this.errorMessage);
          return;
        }

        // Bestimme die Sprache an der Cursorposition
        if (text.includes('---')) {
          const line = this.getLineByPos(text, cursorPosition);
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
        if (!voices[langToPlay] && this.voices[langToPlay] && this.voices[langToPlay].length > 0) {
          voices[langToPlay] = this.voices[langToPlay][0];
        }

        console.log('Spiele Zeile ab in Sprache:', langToPlay, 'mit Stimme:', voices[langToPlay]);

        const response = await fetch(`${this.apiBaseUrl}/api/play-line`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text, 
            cursorPosition, 
            voices, 
            origLang: langToPlay // Verwende die erkannte Sprache
          })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const audio = new Audio(`${this.apiBaseUrl}/api/play/${data.file_name_mp3}`);
        audio.play();
      } catch (error) {
        this.errorMessage = `Fehler beim Abspielen der Zeile: ${error.message}`;
        console.error(this.errorMessage, error);
        alert(this.errorMessage);
      }
    },
    getCursorPosition() {
      const textarea = document.getElementById('inputText');
      return textarea ? textarea.selectionStart : 0;
    },
    getLineByPos(text, position) {
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
    },
    async addLanguage() {
      try {
        this.errorMessage = '';
        if (!this.targetLanguage) {
          this.errorMessage = 'Bitte wähle eine Zielsprache aus.';
          alert(this.errorMessage);
          return;
        }
        if (this.activeLanguages.includes(this.targetLanguage)) {
          this.errorMessage = 'Diese Sprache wurde bereits hinzugefügt.';
          alert(this.errorMessage);
          return;
        }
        if (!this.scriptText.trim()) {
          this.errorMessage = 'Bitte gib einen Text ein.';
          alert(this.errorMessage);
          return;
        }
        
        this.isLoading = true;
        let textToSend = this.scriptText;
        let origLang = this.originalLanguage;
        
        // Falls der Text bereits Übersetzungen enthält
        if (this.scriptText.includes('---')) {
          const parts = this.scriptText.split('---');
          const lines = parts[1].trim().split('\n');
          
          // Finde die Originalsprache
          for (const line of lines) {
            const match = line.match(/#([A-Z]{2}): (.*)/);
            if (match) {
              origLang = match[1];
              break;
            }
          }
          
          // Sende den kompletten Text mit allen Übersetzungen
          textToSend = this.scriptText;
        }
        
        if (this.targetLanguage === origLang) {
          this.errorMessage = 'Zielsprache darf nicht gleich der Originalsprache sein.';
          alert(this.errorMessage);
          this.isLoading = false;
          return;
        }
        
        console.log('Übersetze...', {
          textToSend: textToSend.substring(0, 50) + (textToSend.length > 50 ? '...' : ''),
          targetLang: this.targetLanguage,
          origLang: origLang
        });
        
        let responseData;
        try {
          const response = await fetch(`${this.apiBaseUrl}/api/add-translation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: textToSend,
              targetLang: this.targetLanguage,
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
            const progressUrl = `${this.apiBaseUrl}/api/worker/${workerId}`;
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
                this.errorMessage = `Fehler: ${workerStatus.result.error}`;
                console.error(this.errorMessage);
                alert(this.errorMessage);
                this.isLoading = false;
              } else if (workerStatus.result && workerStatus.result.text) {
                // Formatiere den Text für die Anzeige
                const translatedText = workerStatus.result.text;
                console.log('Übersetzungsergebnis:', translatedText);
                
                // Text aktualisieren
                this.scriptText = translatedText;
                
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
                this.activeLanguages = languageCodes;
                
                // Stelle sicher, dass jede aktive Sprache eine Stimme hat
                for (const lang of this.activeLanguages) {
                  if (!this.selectedVoices[lang] && this.voices[lang] && this.voices[lang].length > 0) {
                    this.selectedVoices[lang] = this.voices[lang][0];
                  }
                }
                
                console.log('Übersetzung erfolgreich hinzugefügt!', {
                  activeLanguages: this.activeLanguages,
                  selectedVoices: this.selectedVoices
                });
              }
              this.isLoading = false;
            } else {
              // Noch nicht fertig, erneute Abfrage nach kurzer Wartezeit
              setTimeout(checkProgress, 500);
            }
          } catch (error) {
            this.errorMessage = `Fehler beim Prüfen des Worker-Status: ${error.message}`;
            console.error(this.errorMessage, error);
            this.isLoading = false;
          }
        };
        
        await checkProgress();
      } catch (error) {
        this.errorMessage = `Fehler beim Hinzufügen der Übersetzung: ${error.message}`;
        console.error(this.errorMessage, error);
        alert(this.errorMessage);
        this.isLoading = false;
      }
    },
    async generateVoiceover() {
      try {
        this.errorMessage = '';
        if (!this.scriptText.trim()) {
          this.errorMessage = 'Bitte gib einen Text ein.';
          alert(this.errorMessage);
          return;
        }
        
        this.isLoading = true;
        const voicesToUse = { ...this.selectedVoices };
        
        // Stelle sicher, dass jede aktive Sprache eine Stimme hat
        for (const lang of this.activeLanguages) {
          if (!voicesToUse[lang] && this.voices[lang] && this.voices[lang].length > 0) {
            voicesToUse[lang] = this.voices[lang][0];
          }
        }
        
        console.log('Generiere Dateien mit Stimmen:', voicesToUse);
        
        const response = await fetch(`${this.apiBaseUrl}/api/make-files`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: this.scriptText,
            voices: voicesToUse,
            origLang: this.originalLanguage
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
            const progressUrl = `${this.apiBaseUrl}/api/worker/${workerId}`;
            console.log('Prüfe Worker-Status:', progressUrl);
            
            const progressResponse = await fetch(progressUrl);
            if (!progressResponse.ok) {
              throw new Error(`HTTP-Fehler bei Worker-Status: ${progressResponse.status}`);
            }
            
            const workerStatus = await progressResponse.json();
            console.log('Worker-Status:', workerStatus);
            
            if (workerStatus.status === 'completed') {
              if (workerStatus.result && workerStatus.result.error) {
                this.errorMessage = `Fehler: ${workerStatus.result.error}`;
                console.error(this.errorMessage);
                alert(this.errorMessage);
              } else if (workerStatus.result && workerStatus.result.download_file_name) {
                const downloadUrl = `${this.apiBaseUrl}/api/download/${workerStatus.result.download_file_name}`;
                this.downloadLink = downloadUrl;
                console.log('Download-Link:', this.downloadLink);
                
                // Automatischer Download
                this.triggerAutomaticDownload(downloadUrl);
              }
              this.isLoading = false;
            } else {
              // Noch nicht fertig, erneute Abfrage nach kurzer Wartezeit
              setTimeout(checkProgress, 500);
            }
          } catch (error) {
            this.errorMessage = `Fehler beim Prüfen des Worker-Status: ${error.message}`;
            console.error(this.errorMessage, error);
            this.isLoading = false;
          }
        };
        
        await checkProgress();
      } catch (error) {
        this.errorMessage = `Fehler beim Generieren der Dateien: ${error.message}`;
        console.error(this.errorMessage, error);
        alert(this.errorMessage);
        this.isLoading = false;
      }
    },
    triggerAutomaticDownload(url) {
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
        this.errorMessage = `Fehler beim automatischen Download: ${error.message}`;
        console.error(this.errorMessage, error);
        // Falls der automatische Download fehlschlägt, zeige eine Nachricht an
        alert('Automatischer Download konnte nicht gestartet werden. Bitte nutzen Sie den Download-Link.');
      }
    },
    clearForm() {
      this.scriptText = '';
      this.activeLanguages = [this.originalLanguage];
      this.selectedVoices = { [this.originalLanguage]: this.voices[this.originalLanguage][0] };
      this.downloadLink = null;
      this.errorMessage = '';
      console.log('Formular zurückgesetzt');
    }
  },
  watch: {
    originalLanguage(newLang, oldLang) {
      if (newLang !== oldLang) {
        this.activeLanguages = [newLang];
        this.selectedVoices = { [newLang]: this.voices[newLang][0] };
        this.scriptText = '';
        this.downloadLink = null;
        this.errorMessage = '';
      }
    }
  }
};
</script>

<style>
.voiceover-assistant {
  font-family: Arial, sans-serif;
  color: #333;
  line-height: 1.4;
  width: 100%;
  height: auto;
  min-height: 100%;
  margin: 0;
  padding: 0.5rem;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

html, body {
  height: 100%;
  margin: 0;
  padding: 0;
}

.container {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.header {
  padding: 10px 15px;
}

h1 {
  color: #0e8a7d;
  margin: 0 0 5px 0;
  font-size: clamp(18px, 3vw, 24px);
}

.description {
  margin-bottom: 5px;
  font-size: clamp(12px, 1.4vw, 14px);
}

.features {
  margin-bottom: 10px;
  font-size: clamp(12px, 1.4vw, 14px);
}

.main-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.column {
  padding: 10px 15px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.left-column {
  flex: 1;
  min-width: 300px;
}

.right-column {
  flex: 1;
  min-width: 300px;
  background-color: #f9f9f9;
}

h2 {
  font-size: clamp(16px, 2.5vw, 18px);
  margin-top: 0;
  margin-bottom: 10px;
}

.input-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}

.language-selection-row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.language-selection-item {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-size: clamp(12px, 1.4vw, 14px);
}

.select-wrapper {
  position: relative;
  margin-bottom: 10px;
}

select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
  font-size: clamp(12px, 1.4vw, 14px);
}

textarea {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #ccc;
  resize: vertical;
  box-sizing: border-box;
  min-height: 150px;
  max-height: 40vh;
  font-size: clamp(12px, 1.4vw, 14px);
}

.add-language-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  white-space: nowrap;
  display: block;
  margin-top: 5px;
  float: right;
  font-size: clamp(12px, 1.4vw, 14px);
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.play-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: clamp(12px, 1.4vw, 14px);
}

.clear-btn {
  background-color: #c00;
  color: white;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
  font-size: clamp(12px, 1.4vw, 14px);
}

.voice-option {
  margin-bottom: 10px;
}

.generate-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 8px 15px;
  cursor: pointer;
  margin-bottom: 15px;
  font-weight: bold;
  font-size: clamp(12px, 1.4vw, 14px);
}

.download-link {
  margin-top: 10px;
  font-size: clamp(12px, 1.4vw, 14px);
}

.disclaimer {
  margin-top: 15px;
  font-size: clamp(10px, 1.2vw, 12px);
}

.disclaimer ul, .disclaimer ol {
  margin: 0;
  padding-left: 20px;
}

.disclaimer li {
  margin-bottom: 3px;
}

.link {
  color: #0e8a7d;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

.voice-selection {
  flex: 0 1 auto;
}

.error-message {
  background-color: #ffeeee;
  border: 1px solid #ff6666;
  color: #cc0000;
  padding: 10px 15px;
  margin: 10px 15px;
  border-radius: 4px;
  position: relative;
  font-size: clamp(12px, 1.4vw, 14px);
}

.close-error {
  position: absolute;
  right: 10px;
  top: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #cc0000;
}

.close-error:hover {
  color: #ff0000;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  
  .column {
    width: 100%;
    min-width: 100%;
  }
  
  .language-selection-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
  
  .header {
    padding: 8px;
  }
}

@media (max-width: 600px) {
  .voiceover-assistant {
    padding: 0.3rem;
  }
  
  .header, .column {
    padding: 8px;
  }
}
</style>