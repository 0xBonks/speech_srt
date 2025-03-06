<template>
  <div class="speech-synth-component">
    <h2>Text zu Sprache Konverter</h2>
    
    <!-- Textbereich -->
    <div class="text-area-container">
      <textarea 
        v-model="text" 
        @click="setCursorPosition($event)" 
        :disabled="isProcessing"
        placeholder="Geben Sie hier Ihren Text ein..."
        rows="10"
        class="full-width"
      ></textarea>
      <div v-if="textError" class="error-message">{{ textError }}</div>
    </div>
    
    <!-- Sprachauswahl -->
    <div class="language-selection">
      <label>Originalsprache:</label>
      <select v-model="origLang" :disabled="!enableOrigLangChange || isProcessing">
        <option v-for="(name, code) in supportedLangs" :key="code" :value="code">
          {{ name }}
        </option>
      </select>
    </div>
    
    <!-- Übersetzung hinzufügen -->
    <div class="add-translation">
      <h3>Übersetzung hinzufügen</h3>
      <select v-model="addedLang" :disabled="isProcessing">
        <option value="">Sprache auswählen</option>
        <option 
          v-for="(name, code) in availableLanguages" 
          :key="code" 
          :value="code"
        >
          {{ name }}
        </option>
      </select>
      <button @click="addLanguage" :disabled="isProcessing">Übersetzung hinzufügen</button>
      <div v-if="translationMessage" class="message">{{ translationMessage }}</div>
      
      <!-- Übersetzungs-Fortschritt -->
      <div v-if="isTranslating" class="progress-container">
        <label>{{ translateStage }} {{ Math.round(translateProgress) }}%</label>
        <progress :value="translateProgress" max="100"></progress>
        <button @click="cancelTranslation">Abbrechen</button>
      </div>
    </div>
    
    <!-- Aktuelle Zeile abspielen -->
    <div class="play-line">
      <button @click="playCurrentLine" :disabled="isProcessing">Aktuelle Zeile abspielen</button>
      <audio v-if="audioFile" controls :src="`/api/play/${audioFile}`"></audio>
    </div>
    
    <!-- Stimmenauswahl -->
    <div class="voice-selection">
      <h3>Stimmen auswählen</h3>
      <div v-for="lang in presentLangs" :key="lang" class="voice-option">
        <label>{{ supportedLangs[lang] || lang }}:</label>
        <select v-model="voices[lang]">
          <option v-for="voice in availableVoices[lang]" :key="voice" :value="voice">
            {{ voice }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- MP3/SRT erstellen -->
    <div class="make-files">
      <button @click="makeFiles" :disabled="isProcessing || !text">MP3/SRT erstellen</button>
      
      <div v-if="makingError" class="error-message">{{ makingError }}</div>
      
      <!-- Fortschrittsanzeige -->
      <div v-if="isMaking" class="progress-container">
        <label>{{ makeStage }} {{ Math.round(makeProgress) }}%</label>
        <progress :value="makeProgress" max="100"></progress>
        <button @click="cancelMaking">Abbrechen</button>
      </div>
      
      <!-- Download-Link -->
      <div v-if="downloadFileName" class="download-container">
        <a :href="`/api/download/${downloadFileName}?name=${downloadAsName}`" class="download-button">
          Ergebnis herunterladen
        </a>
      </div>
    </div>
    
    <!-- Reset-Button -->
    <div class="reset-container">
      <button @click="reset" class="reset-button">Zurücksetzen</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SpeechSynthComponent',
  data() {
    return {
      text: '',
      textError: '',
      makingError: '',
      origLang: 'EN',
      enableOrigLangChange: true,
      addedLang: '',
      translationMessage: '',
      cursorPosition: 0,
      audioFile: '',
      downloadFileName: '',
      downloadAsName: '',
      
      // Worker IDs
      translateWorkerId: '',
      makeWorkerId: '',
      
      // Progress
      translateProgress: 0,
      makeProgress: 0,
      translateStage: '',
      makeStage: '',
      
      // Verfügbare Sprachen und Stimmen
      supportedLangs: {
        'EN': 'English',
        'DE': 'Deutsch',
        'FR': 'Français',
        'ES': 'Español',
        'IT': 'Italiano',
        'PL': 'Polski',
        'PT': 'Português',
        'RU': 'Русский',
        'JA': 'Japanese',
        'ZH': 'Chinese',
        'AR': 'Arabic (Gulf)',
        'NL': 'Dutch',
        'CS': 'Czech',
        'DA': 'Danish',
        'FI': 'Finnish',
        'KO': 'Korean',
        'NB': 'Norwegian',
        'SV': 'Swedish',
        'TR': 'Turkish'
      },
      
      availableVoices: {
        "EN": ['Danielle', 'Gregory', 'Ivy', 'Joanna', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
               'Matthew', 'Ruth', 'Stephen'],
        "DE": ["Daniel", "Vicki"],
        "FR": ["Lea", "Remi"],
        "IT": ["Bianca", "Adriano"],
        "ZH": ["Zhiyu"],
        "JA": ["Kazuha", "Takumi", "Tomoko"],
        "RU": ["Maxim", "Tatyana"],
        'ES': ['Lucia', 'Sergio'],
        'PL': ['Ola'],
        'PT': ['Ines'],
        'AR': ['Hala', 'Zayd'],
        'NL': ['Laura'],
        'CS': ['Jitka'],
        'DA': ['Sofie'],
        'FI': ['Suvi'],
        'KO': ['Seoyeon'],
        'NB': ['Ida'],
        'SV': ['Elin'],
        'TR': ['Burcu']
      },
      
      // Ausgewählte Stimmen
      voices: {}
    };
  },
  
  computed: {
    isProcessing() {
      return this.isTranslating || this.isMaking;
    },
    
    isTranslating() {
      return !!this.translateWorkerId;
    },
    
    isMaking() {
      return !!this.makeWorkerId;
    },
    
    presentLangs() {
      // Extrahiere Sprachcodes aus dem Text
      const startswithSymb = '#';
      const pattern = new RegExp(`^${startswithSymb}([A-Za-z]{2}):`, 'gm');
      const matches = [];
      let match;
      
      const text = this.text || '';
      
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match[1]);
      }
      
      // Füge die Originalsprache hinzu und entferne Duplikate
      return [this.origLang, ...new Set(matches)];
    },
    
    availableLanguages() {
      const result = {};
      const presentLangs = new Set(this.presentLangs);
      
      Object.entries(this.supportedLangs).forEach(([code, name]) => {
        if (!presentLangs.has(code)) {
          result[code] = name;
        }
      });
      
      return result;
    }
  },
  
  watch: {
    presentLangs: {
      handler(newLangs) {
        // Initialisiere Stimmen für neue Sprachen
        newLangs.forEach(lang => {
          if (!this.voices[lang] && this.availableVoices[lang] && this.availableVoices[lang].length > 0) {
            this.$set(this.voices, lang, this.availableVoices[lang][0]);
          }
        });
      },
      immediate: true
    }
  },
  
  methods: {
    setCursorPosition(event) {
      this.cursorPosition = event.target.selectionStart;
    },
    
    async addLanguage() {
      if (!this.addedLang) {
        this.translationMessage = 'Bitte wählen Sie eine Sprache aus';
        return;
      }
      
      if (this.presentLangs.includes(this.addedLang)) {
        this.translationMessage = `Sprache ${this.addedLang} ist bereits vorhanden oder ist die Originalsprache`;
        return;
      }
      
      try {
        const response = await axios.post('/api/add-translation', {
          text: this.text,
          newLang: this.addedLang,
          origLang: this.origLang
        });
        
        this.translateWorkerId = response.data.workerId;
        this.checkTranslationProgress();
      } catch (error) {
        console.error('Fehler beim Hinzufügen der Übersetzung:', error);
        this.textError = error.response?.data?.error || 'Ein Fehler ist aufgetreten';
      }
    },
    
    async checkTranslationProgress() {
      if (!this.translateWorkerId) return;
      
      try {
        const response = await axios.get(`/api/worker/${this.translateWorkerId}`);
        const { status, progress, stage, result } = response.data;
        
        this.translateProgress = progress;
        this.translateStage = stage || 'Übersetze';
        
        if (status === 'completed') {
          if (result.error) {
            this.textError = result.error;
          } else if (result.text) {
            this.text = result.text;
            this.enableOrigLangChange = false;
          }
          
          this.translateWorkerId = '';
          this.translateProgress = 0;
          return;
        }
        
        // Weiter abfragen
        setTimeout(() => this.checkTranslationProgress(), 1000);
      } catch (error) {
        console.error('Fehler beim Abrufen des Übersetzungsfortschritts:', error);
        this.textError = 'Fehler beim Abrufen des Fortschritts';
        this.translateWorkerId = '';
      }
    },
    
    async cancelTranslation() {
      if (!this.translateWorkerId) return;
      
      try {
        await axios.delete(`/api/worker/${this.translateWorkerId}`);
        this.translateWorkerId = '';
        this.translateProgress = 0;
      } catch (error) {
        console.error('Fehler beim Abbrechen der Übersetzung:', error);
      }
    },
    
    async playCurrentLine() {
      try {
        // Hole die aktuelle Zeile basierend auf der Cursorposition
        const lines = this.text.split('\n');
        let currentPos = 0;
        let currentLine = '';
        
        for (const line of lines) {
          if (currentPos + line.length >= this.cursorPosition) {
            currentLine = line;
            break;
          } else {
            currentPos += line.length + 1; // +1 für das '\n' Zeichen
          }
        }
        
        if (!currentLine) {
          this.textError = 'Bitte setzen Sie den Cursor in eine Textzeile';
          return;
        }
        
        const response = await axios.post('/api/play-line', {
          lineOfText: currentLine,
          voices: this.voices,
          origLang: this.origLang
        });
        
        this.audioFile = response.data.file_name_mp3;
      } catch (error) {
        console.error('Fehler beim Abspielen der Zeile:', error);
        this.textError = error.response?.data?.error || 'Ein Fehler ist aufgetreten';
      }
    },
    
    async makeFiles() {
      if (!this.text) {
        this.makingError = 'Bitte geben Sie Text ein';
        return;
      }
      
      try {
        const response = await axios.post('/api/make-files', {
          text: this.text,
          voices: this.voices,
          origLang: this.origLang
        });
        
        this.makeWorkerId = response.data.workerId;
        this.checkMakingProgress();
      } catch (error) {
        console.error('Fehler beim Erstellen der Dateien:', error);
        this.makingError = error.response?.data?.error || 'Ein Fehler ist aufgetreten';
      }
    },
    
    async checkMakingProgress() {
      if (!this.makeWorkerId) return;
      
      try {
        const response = await axios.get(`/api/worker/${this.makeWorkerId}`);
        const { status, progress, stage, result } = response.data;
        
        this.makeProgress = progress;
        this.makeStage = stage || 'Verarbeite';
        
        if (status === 'completed') {
          if (result.error) {
            this.makingError = result.error;
          } else if (result.download_file_name) {
            this.downloadFileName = result.download_file_name;
            
            // Generiere einen Dateinamen mit Zeitstempel
            const now = new Date();
            const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
            this.downloadAsName = `mp3_srt_${timestamp}.zip`;
          }
          
          this.makeWorkerId = '';
          this.makeProgress = 0;
          return;
        }
        
        // Weiter abfragen
        setTimeout(() => this.checkMakingProgress(), 1000);
      } catch (error) {
        console.error('Fehler beim Abrufen des Erstellungsfortschritts:', error);
        this.makingError = 'Fehler beim Abrufen des Fortschritts';
        this.makeWorkerId = '';
      }
    },
    
    async cancelMaking() {
      if (!this.makeWorkerId) return;
      
      try {
        await axios.delete(`/api/worker/${this.makeWorkerId}`);
        this.makeWorkerId = '';
        this.makeProgress = 0;
      } catch (error) {
        console.error('Fehler beim Abbrechen der Erstellung:', error);
      }
    },
    
    reset() {
      this.text = '';
      this.textError = '';
      this.makingError = '';
      this.origLang = 'EN';
      this.enableOrigLangChange = true;
      this.addedLang = '';
      this.translationMessage = '';
      this.audioFile = '';
      this.downloadFileName = '';
      this.downloadAsName = '';
      this.voices = {};
      
      // Initialisiere Stimmen für die Standardsprache
      if (this.availableVoices['EN'] && this.availableVoices['EN'].length > 0) {
        this.$set(this.voices, 'EN', this.availableVoices['EN'][0]);
      }
    }
  },
  
  created() {
    // Initialisiere Stimmen für die Standardsprache
    if (this.availableVoices['EN'] && this.availableVoices['EN'].length > 0) {
      this.$set(this.voices, 'EN', this.availableVoices['EN'][0]);
    }
  }
};
</script>

<style scoped>
.speech-synth-component {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.full-width {
  width: 100%;
}

.text-area-container {
  margin-bottom: 20px;
}

.language-selection, .add-translation, .play-line, .voice-selection, .make-files, .reset-container {
  margin-bottom: 20px;
}

.voice-option {
  margin-bottom: 10px;
}

.error-message {
  color: red;
  margin-top: 5px;
}

.message {
  margin-top: 5px;
}

.progress-container {
  margin-top: 10px;
}

.download-container {
  margin-top: 15px;
}

.download-button {
  display: inline-block;
  padding: 10px 15px;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
}

.reset-button {
  background-color: #f44336;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button {
  padding: 8px 12px;
  margin-right: 5px;
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

select {
  padding: 8px;
  margin-right: 10px;
}

textarea {
  padding: 10px;
  font-family: Arial, sans-serif;
}
</style> 