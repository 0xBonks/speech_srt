<template>
  <ifx-theme>
    <!-- Header -->
    <NavBar @update-status="updateStatus" />
    
    <ifx-layout>
      <ifx-main>
        <ifx-container size="medium" class="app-container">
          <!-- Status Section (optional) -->
          <ifx-section v-if="statusResult" class="status-section">
            <ifx-code-block class="status-result">
              {{ statusResult }}
            </ifx-code-block>
          </ifx-section>

          <!-- Main Steps -->
          <div class="steps-container">
            <!-- Step 1: Language Selection -->
            <ifx-section class="step">
              <ifx-heading level="2" size="lg" class="step-title">
                <ifx-icon name="translate16" class="step-icon"></ifx-icon>
                Schritt 1: Wählen Sie die Originalsprache des Textes
              </ifx-heading>
              <ifx-form-group class="language-controls">
                <ifx-dropdown
                  class="language-select"
                  :value="selectedLanguage"
                  @change="handleLanguageChange"
                  label="Originalsprache"
                >
                  <ifx-dropdown-button>
                    {{ langCodeToName[selectedLanguage] }} ({{ selectedLanguage }})
                  </ifx-dropdown-button>
                  <ifx-dropdown-list>
                    <ifx-dropdown-item
                      v-for="(name, code) in langCodeToName"
                      :key="code"
                      :value="code"
                      :selected="code === selectedLanguage"
                    >
                      {{ name }} ({{ code }})
                    </ifx-dropdown-item>
                  </ifx-dropdown-list>
                </ifx-dropdown>

                <ifx-dropdown
                  class="voice-select"
                  :value="selectedVoice"
                  @change="handleVoiceChange"
                  label="Stimme"
                  :disabled="!availableVoices.length"
                >
                  <ifx-dropdown-button>
                    {{ selectedVoice || 'Bitte erst Sprache wählen' }}
                  </ifx-dropdown-button>
                  <ifx-dropdown-list>
                    <ifx-dropdown-item
                      v-for="voice in availableVoices"
                      :key="voice"
                      :value="voice"
                      :selected="voice === selectedVoice"
                    >
                      {{ voice }}
                    </ifx-dropdown-item>
                  </ifx-dropdown-list>
                </ifx-dropdown>
              </ifx-form-group>
            </ifx-section>

            <!-- Step 2: Text Input -->
            <ifx-section class="step">
              <ifx-heading level="2" size="lg" class="step-title">
                <ifx-icon name="edit16" class="step-icon"></ifx-icon>
                Schritt 2: Geben Sie den Text ein
              </ifx-heading>
              <ifx-textarea
                v-model="inputText"
                placeholder="Text eingeben..."
                rows="6"
                label="Skript Text"
                class="text-input"
              />
              <ifx-button-group class="action-buttons">
                <ifx-button @click="playLine" variant="primary">
                  <ifx-icon name="play16" slot="prefix"></ifx-icon>
                  Aktuelle Zeile abspielen (Alt-P)
                </ifx-button>
                <ifx-button @click="clearForm" variant="secondary">
                  <ifx-icon name="delete16" slot="prefix"></ifx-icon>
                  Formular zurücksetzen
                </ifx-button>
              </ifx-button-group>
            </ifx-section>

            <!-- Step 3: Additional Languages -->
            <ifx-section class="step">
              <ifx-heading level="2" size="lg" class="step-title">
                <ifx-icon name="add16" class="step-icon"></ifx-icon>
                Schritt 3: Fügen Sie weitere Sprachen hinzu
              </ifx-heading>
              <div class="translations-container">
                <!-- Translation controls here -->
                <ifx-button @click="addTranslation" variant="secondary">
                  <ifx-icon name="add16" slot="prefix"></ifx-icon>
                  Sprache hinzufügen
                </ifx-button>
              </div>
              <!-- Translation Progress -->
              <div v-if="showTranslationProgress" class="progress-container">
                <ifx-progress-bar
                  :value="translationProgress"
                  :max="100"
                >
                  Übersetze... ({{ Math.round(translationProgress) }}%)
                </ifx-progress-bar>
              </div>
            </ifx-section>

            <!-- Step 4: Voice Selection and Generation -->
            <ifx-section class="step">
              <ifx-heading level="2" size="lg" class="step-title">
                <ifx-icon name="sound16" class="step-icon"></ifx-icon>
                Schritt 4: Erstellen Sie Voiceover und Untertitel
              </ifx-heading>
              
              <!-- Generation Controls -->
              <ifx-button-group class="generation-controls">
                <ifx-button @click="makeFiles" variant="primary">
                  <ifx-icon name="download16" slot="prefix"></ifx-icon>
                  MP3/SRT erstellen
                </ifx-button>
              </ifx-button-group>

              <!-- Progress and Results -->
              <div v-if="showProgress" class="progress-container">
                <ifx-progress-bar :value="progress" :max="100">
                  {{ progressStage }} ({{ Math.round(progress) }}%)
                </ifx-progress-bar>
              </div>

              <div v-if="showResult" class="result-container">
                <ifx-alert :type="resultType" class="result-alert">
                  {{ resultMessage }}
                </ifx-alert>
                <ifx-link
                  v-if="downloadLink"
                  :href="downloadLink"
                  target="_blank"
                  class="download-link"
                >
                  <ifx-icon name="download16" slot="prefix"></ifx-icon>
                  Dateien herunterladen
                </ifx-link>
              </div>

              <!-- Audio Preview -->
              <audio
                v-if="showAudioPlayer"
                controls
                class="audio-player"
                :src="audioSource"
              ></audio>
            </ifx-section>
          </div>
        </ifx-container>
      </ifx-main>
    </ifx-layout>
  </ifx-theme>
</template>

<script>
import NavBar from './components/NavBar.vue'
import SpeechSynthForm from './components/SpeechSynthForm.vue'

export default {
  name: 'App',
  components: {
    NavBar,
    SpeechSynthForm
  },
  data() {
    return {
      statusResult: '',
      inputText: 'Dies ist ein Test.',
      selectedLanguage: 'DE',
      selectedVoice: '',
      progress: 0,
      progressStage: '',
      showProgress: false,
      resultMessage: '',
      resultType: 'info',
      showResult: false,
      downloadLink: '',
      showAudioPlayer: false,
      audioSource: '',
      langCodeToName: {
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
      voices: {
        "EN": ['Danielle', 'Gregory', 'Ivy', 'Joanna*', 'Kendra', 'Kimberly', 'Salli', 'Joey', 'Justin', 'Kevin',
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
      }
    }
  },
  computed: {
    availableVoices() {
      return this.voices[this.selectedLanguage] || [];
    }
  },
  methods: {
    updateStatus(result) {
      this.statusResult = result;
    },
    updateVoices() {
      if (this.availableVoices.length > 0) {
        this.selectedVoice = this.availableVoices[0];
      }
    },
    async playLine() {
      try {
        this.showResult = true;
        this.resultMessage = "Verarbeite Audio...";
        this.resultType = 'info';
        this.showAudioPlayer = false;

        const response = await fetch('/api/play-line', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: this.inputText,
            cursorPosition: 0,
            voices: { [this.selectedLanguage]: this.selectedVoice },
            origLang: this.selectedLanguage
          })
        });

        const data = await response.json();

        if (data.error) {
          this.resultMessage = `Fehler: ${data.error}`;
          this.resultType = 'error';
        } else if (data.file_name_mp3) {
          this.resultMessage = "Audio bereit!";
          this.resultType = 'success';
          this.showAudioPlayer = true;
          this.audioSource = `/api/play/${data.file_name_mp3}`;
        }
      } catch (error) {
        this.resultMessage = `Fehler: ${error.message}`;
        this.resultType = 'error';
        this.showResult = true;
      }
    },
    async makeFiles() {
      try {
        this.showResult = true;
        this.resultMessage = "Starte Verarbeitung...";
        this.resultType = 'info';
        this.showProgress = false;
        this.downloadLink = '';

        const startResponse = await fetch('/api/make-files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: this.inputText,
            voices: { [this.selectedLanguage]: this.selectedVoice },
            origLang: this.selectedLanguage
          })
        });

        const { workerId } = await startResponse.json();
        this.showProgress = true;

        const checkProgress = async () => {
          const progressResponse = await fetch(`/api/worker/${workerId}`);
          const workerStatus = await progressResponse.json();

          this.progress = workerStatus.progress;
          this.progressStage = workerStatus.stage;

          if (workerStatus.status === 'completed') {
            this.showProgress = false;

            if (workerStatus.result && workerStatus.result.error) {
              this.resultMessage = `Fehler: ${workerStatus.result.error}`;
              this.resultType = 'error';
              this.downloadLink = '';
            } else if (workerStatus.result && workerStatus.result.download_file_name) {
              this.resultMessage = 'Verarbeitung abgeschlossen!';
              this.resultType = 'success';
              this.downloadLink = `/api/download/${workerStatus.result.download_file_name}`;
            } else {
              this.resultMessage = 'Unbekannter Fehler bei der Verarbeitung.';
              this.resultType = 'error';
              this.downloadLink = '';
            }
            return;
          }

          setTimeout(checkProgress, 500);
        };

        checkProgress();
      } catch (error) {
        this.resultMessage = `Fehler: ${error.message}`;
        this.resultType = 'error';
        this.showResult = true;
        this.showProgress = false;
      }
    },
    handleLanguageChange(value) {
      this.selectedLanguage = value;
      this.selectedVoice = '';
      if (this.availableVoices.length > 0) {
        this.selectedVoice = this.availableVoices[0];
      }
    },
    handleVoiceChange(value) {
      this.selectedVoice = value;
    },
    clearForm() {
      this.inputText = '';
      this.selectedLanguage = 'DE';
      this.selectedVoice = '';
      this.progress = 0;
      this.progressStage = '';
      this.showProgress = false;
      this.resultMessage = '';
      this.resultType = 'info';
      this.showResult = false;
      this.downloadLink = '';
      this.showAudioPlayer = false;
      this.audioSource = '';
    },
    addTranslation() {
      // Implementation of addTranslation method
    }
  },
  mounted() {
    this.updateVoices();
  }
}
</script>

<style scoped>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.steps-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.step {
  background-color: var(--ifx-color-background-subtle);
  border-radius: var(--ifx-border-radius-lg);
  padding: 2rem;
}

.step-title {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  color: var(--ifx-color-text-primary);
}

.step-icon {
  margin-right: 0.5rem;
}

.text-input,
.language-select,
.voice-select {
  width: 100%;
}

.action-buttons,
.generation-controls {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.progress-container {
  margin-top: 1.5rem;
}

.result-container {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.audio-player {
  width: 100%;
  margin-top: 1rem;
  border-radius: var(--ifx-border-radius-md);
}

/* Dropdown Styles */
:deep(.ifx-dropdown-button) {
  width: 100%;
  justify-content: space-between;
  padding: 0.5rem 1rem;
}

:deep(.ifx-dropdown-list) {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
}

:deep(.ifx-dropdown-item) {
  padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
  .action-buttons,
  .generation-controls {
    flex-direction: column;
  }
}

.language-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.language-select,
.voice-select {
  width: 100%;
}

@media (max-width: 768px) {
  .language-controls {
    grid-template-columns: 1fr;
  }
}
</style> 