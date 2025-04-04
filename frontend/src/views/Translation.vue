<template>
  <div class="translation-container">
    <h2>Translation</h2>
    
    <div class="language-selectors">
      <div class="language-selector">
        <label for="originalLanguage">Original Language:</label>
        <select v-model="store.originalLanguage" id="originalLanguage" @change="handleOriginalLanguageChange">
          <option v-for="(name, code) in store.languages" :key="code" :value="code">
            {{ name }}
          </option>
        </select>
      </div>
      
      <div class="language-selector">
        <label for="targetLanguage">Target Language:</label>
        <select v-model="store.targetLanguage" id="targetLanguage">
          <option value="">Please select</option>
          <option v-for="(name, code) in store.availableTargetLanguages" :key="code" :value="code">
            {{ name }}
          </option>
        </select>
      </div>
    </div>
    
    <div class="button-container">
      <ifx-button @click="store.addLanguage" theme="default" :disabled="store.isLoading || !store.targetLanguage">
        add language
      </ifx-button>
    </div>
    
    <div class="active-languages" v-if="store.activeLanguages.length > 0">
      <h3>Active Languages:</h3>
      <div class="language-tags">
        <span class="language-tag" v-for="lang in store.activeLanguages" :key="lang">
          {{ store.languages[lang] }}
        </span>
      </div>
    </div>
    
    <div v-if="store.isLoading" class="loading">
      <p>Translating... Please wait.</p>
    </div>
  </div>
</template>

<script setup>
import { useVoiceoverStore } from '../stores/voiceoverStore';
import { onMounted } from 'vue';

const store = useVoiceoverStore();

// Handler for changes to the original language
const handleOriginalLanguageChange = () => {
  console.log('Original language manually changed to:', store.originalLanguage);
  store.updateOnLanguageChange();
};

// Ensure that the active languages include the original language
onMounted(() => {
  if (!store.activeLanguages.includes(store.originalLanguage)) {
    store.updateOnLanguageChange();
  }
  console.log('Translation component loaded. Active languages:', store.activeLanguages);
  console.log('Original language:', store.originalLanguage);
});
</script>

<style scoped>
.translation-container {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

h2, h3 {
  margin-bottom: 20px;
}

.language-selectors {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  width: 100%;
}

.language-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.button-container {
  margin-top: 10px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
}

select {
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 200px;
}

.active-languages {
  margin-top: 10px;
  width: 100%;
}

.language-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
}

.language-tag {
  background-color: #e0f2f1;
  color: #00796b;
  padding: 5px 10px;
  border-radius: 16px;
  font-size: 14px;
}

.loading {
  margin-top: 20px;
  color: #666;
}
</style>
