
<template>
  <div>
    <div>
      <ifx-stepper show-number="false" :active-step="currentStep" variant="default">
        <ifx-step 
          @click="navigateTo('/text-input')" 
          :complete="store.stepStatus['text-input'].complete"
          :error="store.stepStatus['text-input'].error">
          Text Input
        </ifx-step>
        <ifx-step 
          @click="navigateTo('/translation')" 
          :complete="store.stepStatus['translation'].complete"
          :error="store.stepStatus['translation'].error">
          Translation
        </ifx-step>
        <ifx-step 
          @click="navigateTo('/select-voice')" 
          :complete="store.stepStatus['select-voice'].complete"
          :error="store.stepStatus['select-voice'].error">
          Select Voice
        </ifx-step>
        <ifx-step 
          @click="navigateTo('/audio-output')" 
          :complete="store.stepStatus['audio-output'].complete"
          :error="store.stepStatus['audio-output'].error">
          Audio Output
        </ifx-step>
      </ifx-stepper>
    </div>
    <br />
    <br />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVoiceoverStore } from '../stores/voiceoverStore';

const router = useRouter();
const route = useRoute();
const store = useVoiceoverStore();

// Berechne den aktuellen Schritt basierend auf der Route
const currentStep = computed(() => {
  return route.meta.step || 1;
});

// Funktion zum Navigieren zu einer Route
const navigateTo = (path) => {
  router.push(path);
};
</script>