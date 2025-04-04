<template>
  <div class="audio-output-container">
    <h2>Audio Output</h2>
    
    <div v-if="store.isLoading" class="loading">
      <p>Generating audio files... Please wait.</p>
    </div>
    
    <div v-else-if="store.downloadLink" class="download-section">
      <p>Your audio files are ready!</p>
      <div class="button-group">
        <ifx-button 
          @click="downloadFiles" 
          theme="default">
          download again
        </ifx-button>
        <ifx-button 
          @click="resetProcess" 
          theme="default"
          variant="secondary">
          start new project
        </ifx-button>
      </div>
    </div>
    
    <div v-else class="generate-section">
      <div class="button-group">
        <ifx-button 
          @click="store.generateVoiceover" 
          theme="default" 
          :disabled="!canGenerate">
          generate
        </ifx-button>
      </div>
    </div>
    
    <div v-if="store.errorMessage" class="error-message">
      <p>{{ store.errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { useVoiceoverStore } from '../stores/voiceoverStore';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

const store = useVoiceoverStore();
const router = useRouter();

// Prüfen, ob genügend Daten für die Generierung vorhanden sind
const canGenerate = computed(() => {
  return store.scriptText.trim() !== '' && 
         store.activeLanguages.length > 0 && 
         Object.keys(store.selectedVoices).length > 0;
});

// Funktion zum erneuten Herunterladen der Dateien
const downloadFiles = () => {
  if (store.downloadLink) {
    store.triggerAutomaticDownload(store.downloadLink);
  }
};

// Funktion zum Zurücksetzen des gesamten Prozesses
const resetProcess = () => {
  store.clearForm();
  router.push('/text-input');
};
</script>

<style scoped>
.audio-output-container {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  height: 100%;
}

h2 {
  margin-bottom: 20px;
}

.loading, .download-section, .generate-section {
  margin: 20px 0;
  padding: 20px;
  border-radius: 0;
  background-color: transparent;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.generate-info {
  margin-bottom: 20px;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.error-message {
  margin-top: 20px;
  color: #d32f2f;
  font-weight: bold;
}
</style>
