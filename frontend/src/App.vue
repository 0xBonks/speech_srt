<template>
  <div class="app-container">
    <div class="main-content">
      <Navbar/>
      <div class="content-area">
        <!-- Stepper nur anzeigen, wenn wir nicht auf der Instructions- oder Help-Seite sind -->
        <Stepper v-if="!isSpecialPage"/>
        <!-- Unterschiedliches Layout für Instructions- oder Help-Seite und normale Seiten -->
        <div v-if="isSpecialPage" class="instructions-container">
          <router-view></router-view>
        </div>
        <div v-else class="white-container">
          <div style="flex: 1; overflow-y: auto;">
            <router-view></router-view>
          </div>
          <div class="navigation-buttons">
            <ifx-button 
              v-if="!isFirstStep"
              theme="default" 
              variant="secondary" 
              @click="navigateToPrevious">
              back
            </ifx-button>
            <div v-else></div>
            <ifx-button 
              theme="default" 
              @click="navigateToNext" 
              :disabled="isNextButtonDisabled">
              <span v-if="!isLastStep">next</span>
              <span v-else>create</span>
            </ifx-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
import Stepper from './components/Stepper.vue';
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';
import { useVoiceoverStore } from './stores/voiceoverStore';

const router = useRouter();
const route = useRoute();
const store = useVoiceoverStore();

// Prüfen, ob wir auf der Instructions- oder Help-Seite sind
const isSpecialPage = computed(() => {
  return route.path === '/instructions' || route.path === '/help';
});

// Die Reihenfolge der Routen
const routeOrder = [
  '/text-input',
  '/translation',
  '/select-voice',
  '/audio-output'
];

// Aktueller Schritt basierend auf der Route
const currentRouteIndex = computed(() => {
  return routeOrder.findIndex(path => path === route.path);
});

// Aktuelle Route als Name
const currentRouteName = computed(() => {
  const path = route.path;
  return path.substring(1); // Entferne den führenden Slash
});

// Prüfen, ob wir auf dem ersten oder letzten Schritt sind
const isFirstStep = computed(() => currentRouteIndex.value <= 0);
const isLastStep = computed(() => currentRouteIndex.value >= routeOrder.length - 1);

// Prüfen, ob der Next-Button deaktiviert werden soll
const isNextButtonDisabled = computed(() => {
  // Wenn wir auf dem letzten Schritt sind, ist der Button immer deaktiviert
  if (isLastStep.value) {
    return true;
  }
  
  // Prüfen basierend auf dem aktuellen Schritt
  if (currentRouteName.value === 'select-voice') {
    // Prüfen, ob für jede aktive Sprache eine Stimme ausgewählt wurde
    return !store.activeLanguages.every(lang => 
      store.selectedVoices[lang] && store.selectedVoices[lang].trim() !== ''
    );
  }
  
  return false;
});

// Navigation zum vorherigen Schritt
const navigateToPrevious = () => {
  if (!isFirstStep.value) {
    router.push(routeOrder[currentRouteIndex.value - 1]);
  }
};

// Navigation zum nächsten Schritt
const navigateToNext = async () => {
  if (isLastStep.value || (isNextButtonDisabled.value && 
      currentRouteName.value !== 'text-input' && 
      currentRouteName.value !== 'translation')) {
    return;
  }
  
  let isValid = true;
  
  // Validierung basierend auf dem aktuellen Schritt
  if (currentRouteName.value === 'text-input') {
    // Validiere nur den Text, ohne automatische Übersetzung
    isValid = store.validateTextInput();
    // Bei TextInput immer weitergehen, auch wenn nicht valid
    if (!isValid) {
      // Navigiere zum nächsten Schritt, aber markiere den aktuellen als fehlerhaft
      store.setStepError(currentRouteName.value);
      router.push(routeOrder[currentRouteIndex.value + 1]);
      return;
    }
    
    // Markiere den Schritt als abgeschlossen und navigiere zum nächsten Schritt
    store.setStepComplete(currentRouteName.value);
    router.push(routeOrder[currentRouteIndex.value + 1]);
    return;
  } else if (currentRouteName.value === 'translation') {
    isValid = store.validateTranslation();
    // Bei Translation immer weitergehen, auch wenn nicht valid
    if (!isValid) {
      // Navigiere zum nächsten Schritt, aber markiere den aktuellen als fehlerhaft
      store.setStepError(currentRouteName.value);
      router.push(routeOrder[currentRouteIndex.value + 1]);
      return;
    }
  } else if (currentRouteName.value === 'select-voice') {
    isValid = store.validateVoiceSelection();
  }
  
  if (isValid) {
    // Markiere den aktuellen Schritt als abgeschlossen
    store.setStepComplete(currentRouteName.value);
    
    // Navigiere zum nächsten Schritt
    router.push(routeOrder[currentRouteIndex.value + 1]);
  }
};
</script>

<style>
*{
  font-family: "Source Sans 3", "sans-serif";
}

.white-container {
  background-color: #fff;
  padding: 20px;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  min-height: 450px;
  height: 450px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.white-container > *:first-child {
  flex: 1;
  overflow-y: auto;
}

.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.app-container {
  display: flex;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.navbar {
  border-bottom: 1px solid #e0e0e0;
}

.content-area {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
}

.instructions-container {
  padding: 20px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}
</style>