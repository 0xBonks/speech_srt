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
      originalLanguage: 'DE',
      targetLanguage: '',
      scriptText: '',
      activeLanguages: ['DE'],
      selectedVoices: { 'DE': 'Daniel' },
      isLoading: false,
      downloadLink: null,
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
        const text = this.scriptText;
        const cursorPosition = this.getCursorPosition();
        const voices = this.selectedVoices;
        const origLang = this.originalLanguage;

        const response = await fetch('/api/play-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, cursorPosition, voices, origLang })
        });

        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }

        const audio = new Audio(`/api/play/${data.file_name_mp3}`);
        audio.play();
      } catch (error) {
        console.error('Fehler beim Abspielen der Zeile:', error);
      }
    },
    getCursorPosition() {
      const textarea = document.getElementById('inputText');
      return textarea ? textarea.selectionStart : 0;
    },
    async addLanguage() {
      try {
        if (!this.targetLanguage) {
          console.error('Bitte wähle eine Zielsprache aus.');
          return;
        }
        if (this.activeLanguages.includes(this.targetLanguage)) {
          console.error('Diese Sprache wurde bereits hinzugefügt.');
          return;
        }
        if (!this.scriptText.trim()) {
          console.error('Bitte gib einen Text ein.');
          return;
        }
        this.isLoading = true;
        let origText = this.scriptText;
        let origLang = this.originalLanguage;
        if (this.scriptText.includes('---')) {
          const parts = this.scriptText.split('---');
          const lines = parts[1].trim().split('\n');
          for (const line of lines) {
            const match = line.match(/#([A-Z]{2}): (.*)/);
            if (match) {
              origLang = match[1];
              origText = match[2].trim();
              break;
            }
          }
        }
        if (this.targetLanguage === origLang) {
          console.error('Zielsprache darf nicht gleich der Originalsprache sein.');
          return;
        }
        console.log('Übersetze...');
        const response = await fetch('/api/add-translation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: origText,
            targetLang: this.targetLanguage,
            origLang: origLang
          })
        });
        if (!response.ok) throw new Error(`HTTP-Fehler: ${response.status}`);
        const { workerId } = await response.json();
        const checkProgress = async () => {
          const progressResponse = await fetch(`/api/worker/${workerId}`);
          const workerStatus = await progressResponse.json();
          if (workerStatus.status === 'completed') {
            if (workerStatus.result.error) {
              console.error('Fehler:', workerStatus.result.error);
            } else if (workerStatus.result.text) {
              let newText = '---\n';
              newText += `#${origLang}: ${origText}\n`;
              if (this.scriptText.includes('---')) {
                const parts = this.scriptText.split('---');
                const existingTranslations = parts[1].trim().split('\n');
                for (const line of existingTranslations) {
                  const match = line.match(/#([A-Z]{2}): (.*)/);
                  if (match && match[1] !== origLang && match[1] !== this.targetLanguage) {
                    newText += `${line}\n`;
                  }
                }
              }
              const translatedLines = workerStatus.result.text.split('\n');
              let translatedText = '';
              for (const line of translatedLines) {
                if (line.startsWith(`#${this.targetLanguage}:`)) {
                  translatedText = line.substring(line.indexOf(':') + 1).trim();
                  break;
                }
              }
              newText += `#${this.targetLanguage}: ${translatedText}`;
              this.scriptText = newText;
              this.activeLanguages.push(this.targetLanguage);
              this.$set(this.selectedVoices, this.targetLanguage, this.voices[this.targetLanguage][0]);
              console.log('Übersetzung hinzugefügt!');
            }
            this.isLoading = false;
          } else {
            setTimeout(checkProgress, 500);
          }
        };
        await checkProgress();
      } catch (error) {
        console.error('Fehler beim Hinzufügen der Übersetzung:', error.message);
        this.isLoading = false;
      }
    },
    async generateVoiceover() {
      try {
        if (!this.scriptText.trim()) {
          console.error('Bitte gib einen Text ein.');
          return;
        }
        this.isLoading = true;
        const voicesToUse = { ...this.selectedVoices };
        for (const lang of this.activeLanguages) {
          if (!voicesToUse[lang]) {
            voicesToUse[lang] = this.voices[lang][0];
          }
        }
        console.log('Generiere Dateien mit Stimmen:', voicesToUse);
        const response = await fetch('/api/make-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: this.scriptText,
            voices: voicesToUse,
            origLang: this.originalLanguage
          })
        });
        const { workerId } = await response.json();
        console.log('Worker ID:', workerId);
        const checkProgress = async () => {
          const progressResponse = await fetch(`/api/worker/${workerId}`);
          const workerStatus = await progressResponse.json();
          if (workerStatus.status === 'completed') {
            if (workerStatus.result.error) {
              console.error('Fehler:', workerStatus.result.error);
            } else if (workerStatus.result.download_file_name) {
              this.downloadLink = `/api/download/${workerStatus.result.download_file_name}`;
              console.log('Download-Link:', this.downloadLink);
            }
            this.isLoading = false;
          } else {
            setTimeout(checkProgress, 500);
          }
        };
        await checkProgress();
      } catch (error) {
        console.error('Fehler beim Generieren der Dateien:', error.message);
        this.isLoading = false;
      }
    },
    clearForm() {
      this.scriptText = '';
      this.activeLanguages = [this.originalLanguage];
      this.selectedVoices = { [this.originalLanguage]: this.voices[this.originalLanguage][0] };
      this.downloadLink = null;
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
      }
    }
  }
};
</script>

<style>
.voiceover-assistant {
  font-family: Arial, sans-serif;
  color: #333;
  line-height: 1.5;
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0.7rem 0.5rem;
  box-sizing: border-box;
  overflow: hidden;
}

html, body {
  height: 100%;
  overflow: hidden;
}

.container {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.header {
  padding: 20px;
}

h1 {
  color: #0e8a7d;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.description {
  margin-bottom: 10px;
}

.features {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.column {
  padding: 20px;
  box-sizing: border-box;
}

.left-column {
  flex: 1;
  min-width: 400px;
}

.right-column {
  flex: 1;
  min-width: 400px;
  background-color: #f9f9f9;
}

h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
}

.input-group {
  margin-bottom: 20px;
}

.language-selection-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.language-selection-item {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
}

.select-wrapper {
  position: relative;
  margin-bottom: 10px;
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  resize: vertical;
  box-sizing: border-box;
}

.add-language-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
  display: block;
  margin-top: 5px;
  float: right;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.play-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}

.clear-btn {
  background-color: #c00;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}

.voice-option {
  margin-bottom: 10px;
}

.generate-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
}

.download-link {
  margin-top: 10px;
}

.disclaimer {
  margin-top: 20px;
  font-size: 14px;
}

.disclaimer ul {
  margin: 0;
  padding-left: 20px;
}

.disclaimer li {
  margin-bottom: 5px;
}

.link {
  color: #0e8a7d;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  
  .column {
    width: 100%;
  }
  
  .language-selection-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>