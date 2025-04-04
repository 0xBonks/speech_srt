<template>
  <div class="text-input-container">
    <h2 class="section-title">Text Input:</h2>
    <div class="text-area-container">
      <textarea v-model="store.scriptText" :rows="calculateRows()" id="inputText"></textarea>
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
import { watch, ref, onMounted, onUnmounted } from 'vue';

const store = useVoiceoverStore();
const windowHeight = ref(window.innerHeight);

// Function to calculate appropriate number of rows based on window height
function calculateRows() {
  // Base calculation on window height
  // For smaller screens (e.g., laptops), use fewer rows
  // For larger screens (e.g., desktops), use more rows
  const baseRows = 16;
  
  if (windowHeight.value < 700) {
    return 14; // Smaller screens
  } else if (windowHeight.value > 1200) {
    return 28; // Larger screens
  } else {
    // Linear interpolation between 15 and 29 rows
    return Math.floor(14 + ((windowHeight.value - 700) / 500) * 14);
  }
}

// Update window height on resize
function handleResize() {
  windowHeight.value = window.innerHeight;
}

// Check if textarea content overflows and add/remove overflow class accordingly
function checkOverflow() {
  const textarea = document.getElementById('inputText');
  if (textarea) {
    if (textarea.scrollHeight > textarea.clientHeight) {
      textarea.classList.add('overflow');
    } else {
      textarea.classList.remove('overflow');
    }
  }
}

// Add and remove event listeners
onMounted(() => {
  window.addEventListener('resize', handleResize);
  
  // Check for overflow initially and whenever text changes
  setTimeout(checkOverflow, 100); // Initial check after render
  
  // Watch for text changes to check overflow
  watch(() => store.scriptText, () => {
    setTimeout(checkOverflow, 10);
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});

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
  max-width: 100%;
  margin-bottom: 20px;
  padding: 0;
  box-sizing: border-box;
}

textarea {
  width: 100%;
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
  /* Only show scrollbar when needed */
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
}

/* Only show scrollbar when content overflows */
textarea::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

textarea.overflow {
  scrollbar-width: thin; /* Firefox */
}

textarea.overflow::-webkit-scrollbar {
  display: block; /* Chrome, Safari, Edge */
  width: 8px;
}

textarea.overflow::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

.section-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
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
