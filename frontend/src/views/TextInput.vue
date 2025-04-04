<template>
  <div class="text-input-container">
    <h2>Textinput:</h2>
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

const store = useVoiceoverStore();
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
