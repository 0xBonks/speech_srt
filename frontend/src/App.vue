<template>
  <div class="app-container">
    <div class="main-content">
      <Navbar/>
      <div class="content-area">
        <!-- Only display the stepper when we are not on the Instructions or Help page -->
        <Stepper v-if="!isSpecialPage"/>
        <!-- Different layout for Instructions or Help page and normal pages -->
        <div v-if="isSpecialPage" class="instructions-container">
          <router-view></router-view>
        </div>
        <div v-else class="content-layout">
          <div class="disclaimer-container">
            <h2 class="section-title">Disclaimer</h2>
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
          <div class="white-container">
            <div style="flex: 1; overflow: hidden;">
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

// Check if we are on the Instructions or Help page
const isSpecialPage = computed(() => {
  return route.path === '/instructions' || route.path === '/help';
});

// The order of routes
const routeOrder = [
  '/text-input',
  '/translation',
  '/select-voice',
  '/audio-output'
];

// Current step based on the route
const currentRouteIndex = computed(() => {
  return routeOrder.findIndex(path => path === route.path);
});

// Current route as name
const currentRouteName = computed(() => {
  const path = route.path;
  return path.substring(1); // Remove the leading slash
});

// Check if we are on the first or last step
const isFirstStep = computed(() => currentRouteIndex.value <= 0);
const isLastStep = computed(() => currentRouteIndex.value >= routeOrder.length - 1);

// Check if the Next button should be disabled
const isNextButtonDisabled = computed(() => {
  // If we are on the last step, the button is always disabled
  if (isLastStep.value) {
    return true;
  }
  
  // Check based on the current step
  if (currentRouteName.value === 'select-voice') {
    // Check if a voice has been selected for each active language
    return !store.activeLanguages.every(lang => 
      store.selectedVoices[lang] && store.selectedVoices[lang].trim() !== ''
    );
  }
  
  return false;
});

// Navigation to the previous step
const navigateToPrevious = () => {
  if (!isFirstStep.value) {
    router.push(routeOrder[currentRouteIndex.value - 1]);
  }
};

// Navigation to the next step
const navigateToNext = async () => {
  if (isLastStep.value || (isNextButtonDisabled.value && 
      currentRouteName.value !== 'text-input' && 
      currentRouteName.value !== 'translation')) {
    return;
  }
  
  let isValid = true;
  
  // Validation based on the current step
  if (currentRouteName.value === 'text-input') {
    // Validate only the text, without automatic translation
    isValid = store.validateTextInput();
    // Always proceed with TextInput, even if not valid
    if (!isValid) {
      // Navigate to the next step, but mark the current one as having an error
      store.setStepError(currentRouteName.value);
      router.push(routeOrder[currentRouteIndex.value + 1]);
      return;
    }
    
    // Mark the step as completed and navigate to the next step
    store.setStepComplete(currentRouteName.value);
    router.push(routeOrder[currentRouteIndex.value + 1]);
    return;
  } else if (currentRouteName.value === 'translation') {
    isValid = store.validateTranslation();
    // Always proceed with Translation, even if not valid
    if (!isValid) {
      // Navigate to the next step, but mark the current one as having an error
      store.setStepError(currentRouteName.value);
      router.push(routeOrder[currentRouteIndex.value + 1]);
      return;
    }
  } else if (currentRouteName.value === 'select-voice') {
    isValid = store.validateVoiceSelection();
  }
  
  if (isValid) {
    // Mark the current step as completed
    store.setStepComplete(currentRouteName.value);
    
    // Navigiere zum nächsten Schritt
    router.push(routeOrder[currentRouteIndex.value + 1]);
  }
};
</script>

<style>
* {
  font-family: "Source Sans 3", "sans-serif";
  scrollbar-width: thin;
}

/* Hide scrollbar when not needed */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-thumb {
  background-color: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background-color: transparent;
}

.content-layout {
  display: flex;
  width: 100%;
  gap: 20px;
  justify-content: center;
}

.disclaimer-container {
  background-color: #fff;
  padding: 20px;
  width: 25%;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  height: 450px;
  overflow: hidden;
}

.section-title {
  margin-bottom: 20px;
  margin-top: 0;
  padding-top: 0;
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.2;
}

.disclaimer-container p {
  margin-bottom: 15px;
  font-size: 14px;
  line-height: 1.5;
}

.disclaimer-container ol {
  margin-left: 0;
  padding-left: 17px;
  margin-bottom: 15px;
}

.disclaimer-container ul {
  margin-left: 0;
  padding-left: 20px;
  margin-bottom: 15px;
}

.disclaimer-container li {
  margin-bottom: 5px;
  font-size: 14px;
  line-height: 1.5;
}

.disclaimer-container .link {
  color: #0066cc;
  text-decoration: none;
}

.disclaimer-container .link:hover {
  text-decoration: underline;
}

.white-container {
  background-color: #fff;
  padding: 20px;
  width: 50%;
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
  overflow: hidden;
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
  overflow: auto;
  background-color: #f5f5f5;
}

.instructions-container {
  padding: 20px;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
}
</style>