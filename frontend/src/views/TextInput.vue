<template>
  <div class="text-input-container">
    <h2>Text Input:</h2>
    <div class="text-area-container">
      <textarea v-model="store.scriptText" rows="16" id="inputText"></textarea>
    </div>
    <div class="button-container actions">
      <!--
      <ifx-button @click="store.playLine" theme="default" variant="secondary">
        play line
      </ifx-button>
      -->
    </div>
  </div>
</template>

<script setup>
import { useVoiceoverStore } from '../stores/voiceoverStore';
import { watch } from 'vue';

const store = useVoiceoverStore();

// Function for simple language detection
function detectLanguage(text) {
  if (!text || text.trim().length < 5) return null;
  
  // Simple language detection based on common words and letters
  const germanWords = ['der', 'die', 'das', 'und', 'ist', 'in', 'den', 'von', 'zu', 'mit', 'sich', 'auf', 'für', 'ein', 'eine'];
  const englishWords = ['the', 'and', 'is', 'in', 'to', 'of', 'a', 'for', 'that', 'have', 'with', 'this', 'on', 'are', 'as'];
  
  // Count German and English words
  const words = text.toLowerCase().split(/\s+/);
  let germanCount = 0;
  let englishCount = 0;
  
  for (const word of words) {
    if (germanWords.includes(word)) germanCount++;
    if (englishWords.includes(word)) englishCount++;
  }
  
  // Check for umlauts (typical for German)
  const germanChars = text.match(/[äöüß]/gi) || [];
  germanCount += germanChars.length;
  
  console.log('Language detection:', { germanCount, englishCount });
  
  // Decide based on the number of recognized words
  if (germanCount > englishCount) return 'DE';
  if (englishCount > germanCount) return 'EN';
  
  // If no clear decision is possible, keep the current language
  return null;
}

// Watch for changes to the text and update the language automatically
watch(() => store.scriptText, (newText) => {
  if (!newText || newText.trim().length < 10) return;
  
  const detectedLang = detectLanguage(newText);
  if (detectedLang && detectedLang !== store.originalLanguage) {
    console.log(`Language detected: ${detectedLang}, changing from ${store.originalLanguage}`);
    store.originalLanguage = detectedLang;
    store.updateOnLanguageChange();
  }
}, { immediate: true });
</script>

<style scoped>
.text-input-container {
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

.text-area-container {
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
  padding: 0 15px;
  box-sizing: border-box;
}

textarea {
  width: 100%;
  height: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-family: inherit;
  box-sizing: border-box;
  overflow-x: hidden;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: pre-wrap;
}

.button-container {
  margin-top: 10px;
}

.actions {
  justify-content: center;
  gap: 10px;
}

.error-message {
  color: #d32f2f;
  margin-top: 10px;
  font-weight: bold;
}
</style>
