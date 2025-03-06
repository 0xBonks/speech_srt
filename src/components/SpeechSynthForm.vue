<template>
  <ifx-section class="speech-form">
    <ifx-heading level="2" size="xl" class="section-title">
      <ifx-icon name="sound16" class="title-icon"></ifx-icon>
      Text zu Sprache
    </ifx-heading>
    
    <div class="form-container">
      <ifx-textarea
        v-model="inputText"
        placeholder="Text eingeben..."
        rows="6"
        label="Text"
        class="text-input"
      />

      <div class="controls-container">
        <ifx-form-group class="language-controls">
          <!-- Sprachen Dropdown -->
          <ifx-dropdown
            class="language-select"
            :value="selectedLanguage"
            @change="handleLanguageChange"
            label="Sprache"
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

          <!-- Stimmen Dropdown -->
          <ifx-dropdown
            class="voice-select"
            :value="selectedVoice"
            @change="handleVoiceChange"
            label="Stimme"
          >
            <ifx-dropdown-button>
              {{ selectedVoice || 'Stimme wählen' }}
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

        <ifx-button-group class="action-buttons">
          <ifx-button @click="$emit('play-line')" variant="primary">
            <ifx-icon name="play16" slot="prefix"></ifx-icon>
            Zeile abspielen
          </ifx-button>
          <ifx-button @click="$emit('make-files')" variant="secondary">
            <ifx-icon name="download16" slot="prefix"></ifx-icon>
            MP3/SRT erstellen
          </ifx-button>
        </ifx-button-group>
      </div>

      <!-- Progress Bar -->
      <div v-if="showProgress" class="progress-container">
        <ifx-progress-bar
          :value="progress"
          :max="100"
          class="progress-bar"
        >
          {{ progressStage }} ({{ Math.round(progress) }}%)
        </ifx-progress-bar>
      </div>

      <!-- Result Messages -->
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

      <!-- Audio Player -->
      <audio
        v-if="showAudioPlayer"
        controls
        class="audio-player"
        :src="audioSource"
      ></audio>
    </div>
  </ifx-section>
</template>

<script>
export default {
  name: 'SpeechSynthForm',
  props: {
    showProgress: Boolean,
    progress: Number,
    progressStage: String,
    showResult: Boolean,
    resultMessage: String,
    resultType: String,
    downloadLink: String,
    showAudioPlayer: Boolean,
    audioSource: String
  },
  data() {
    return {
      inputText: 'Dies ist ein Test.',
      selectedLanguage: 'DE',
      selectedVoice: '',
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
    handleLanguageChange(event) {
      this.selectedLanguage = event;
      this.updateVoices();
    },
    handleVoiceChange(event) {
      this.selectedVoice = event;
    },
    updateVoices() {
      if (this.availableVoices.length > 0) {
        this.selectedVoice = this.availableVoices[0];
      }
    }
  },
  mounted() {
    this.updateVoices();
  },
  emits: ['play-line', 'make-files']
}
</script>

<style scoped>
.speech-form {
  background-color: var(--ifx-color-background-subtle);
  border-radius: var(--ifx-border-radius-lg);
  padding: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  color: var(--ifx-color-text-primary);
}

.title-icon {
  margin-right: 0.5rem;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.text-input {
  width: 100%;
  font-size: var(--ifx-font-size-md);
}

.controls-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.language-controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.language-select,
.voice-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  justify-content: flex-start;
  gap: 1rem;
}

.progress-container {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.result-alert {
  width: 100%;
}

.download-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.audio-player {
  width: 100%;
  margin-top: 1rem;
  border-radius: var(--ifx-border-radius-md);
}

/* Dropdown-spezifische Styles */
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
  .language-controls {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style> 