<template>
  <div class="select-voice-container">
    <h2 class="section-title">Select Voice</h2>
    
    <div v-if="store.activeLanguages.length > 0" class="voice-selection">
      <div class="voice-table">
        <table>
          <thead>
            <tr>
              <th>Language</th>
              <th>Voice</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lang in store.activeLanguages" :key="lang">
              <td>{{ store.languages[lang] }}</td>
              <td>
                <select v-model="store.selectedVoices[lang]">
                  <option v-for="voice in store.voices[lang]" :key="voice" :value="voice">
                    {{ voice }}
                  </option>
                </select>
              </td>
              <td>
                <ifx-button 
                  @click="testVoice(lang)" 
                  theme="default" 
                  variant="secondary" 
                  size="s">
                  test voice
                </ifx-button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div v-else class="no-languages">
      <p>Please add languages in the Translation step first.</p>
    </div>
  </div>
</template>

<script setup>
import { useVoiceoverStore } from '../stores/voiceoverStore';

const store = useVoiceoverStore();

// Function to test a voice
const testVoice = async (lang) => {
  try {
    // Check if text has been entered
    if (!store.scriptText.trim()) {
      alert('Please enter a text in the Text Input view first.');
      return;
    }

    const voice = store.selectedVoices[lang];
    
    // Use the text from the textarea if available, otherwise use the standard test text
    let testText = store.scriptText.trim();
    
    // If the text contains translations, extract the text for the corresponding language
    if (testText.includes('---')) {
      const parts = testText.split('---');
      if (parts.length >= 2) {
        const lines = parts[1].trim().split('\n');
        const langPrefix = `#${lang}:`;
        
        for (const line of lines) {
          if (line.startsWith(langPrefix)) {
            testText = line.substring(langPrefix.length).trim();
            break;
          }
        }
      }
    }
    
    // If no specific text for the language was found, use the standard test text
    if (!testText || testText === store.scriptText.trim()) {
      testText = getTestText(lang);
    }
    
    const response = await fetch(`${store.apiBaseUrl}/api/test-voice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: testText,
        voice: voice,
        language: lang
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.error) {
      throw new Error(data.error);
    }
    
    const audio = new Audio(`${store.apiBaseUrl}/api/play/${data.file_name_mp3}`);
    audio.play();
  } catch (error) {
    console.error('Error testing the voice:', error);
    alert(`Error testing the voice: ${error.message}`);
  }
};

// Helper function to get a test text for each language
const getTestText = (lang) => {
  const testTexts = {
    'DE': 'Dies ist ein Test der deutschen Stimme.',
    'EN': 'This is a test of the English voice.',
    'FR': 'Ceci est un test de la voix française.',
    'ES': 'Esta es una prueba de la voz española.',
    'IT': 'Questo è un test della voce italiana.',
    'PL': 'To jest test polskiego głosu.',
    'PT': 'Este é um teste da voz portuguesa.',
    'RU': 'Это тест русского голоса.',
    'JA': 'これは日本語の声のテストです。',
    'ZH': '这是中文语音的测试。',
    'AR': 'هذا اختبار للصوت العربي.',
    'NL': 'Dit is een test van de Nederlandse stem.',
    'CS': 'Toto je test českého hlasu.',
    'DA': 'Dette er en test af den danske stemme.',
    'FI': 'Tämä on suomalaisen äänen testi.',
    'KO': '이것은 한국어 음성 테스트입니다.',
    'NB': 'Dette er en test av den norske stemmen.',
    'SV': 'Detta är ett test av den svenska rösten.',
    'TR': 'Bu Türkçe sesin bir testidir.'
  };
  
  return testTexts[lang] || 'Test';
};
</script>

<style scoped>
.select-voice-container {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

.section-title {
  margin-bottom: 20px;
  font-size: 1.5rem;
  font-weight: 600;
}

.voice-selection {
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
}

.voice-table {
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

th {
  background-color: #f8f9fa;
  font-weight: bold;
}

td {
  vertical-align: middle;
}

select {
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
  width: 100%;
  max-width: 200px;
}

.no-languages {
  margin-top: 20px;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}
</style>
