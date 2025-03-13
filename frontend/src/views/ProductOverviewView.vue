<template>
  <div class="voiceover-assistant">
    <div class="container">
      <div class="header">
        <h1>Multilingual Voiceover Assistant</h1>
        <p class="description">
          With Explore the Multilingual Voiceover Assistant, a tool designed to help you create high-quality voiceovers and subtitles for internal videos and screencasts. Leveraging advanced text-to-speech technology, it produces natural-sounding voices that perfectly match your subtitles, with synchronized SRT files for easy integration into videos.
        </p>
        <div class="features">
          <p><strong>Features:</strong></p>
          <p>Translation, Text-to-Speech: Conversion (mp3), Caption file creation (srt)</p>
        </div>
      </div>

      <div class="main-content">
        <!-- Left Column -->
        <div class="column left-column">
          <h2>Translation</h2>
          
          <div class="language-selection-row">
            <div class="language-selection-item">
              <label>Select the original language of the text</label>
              <div class="select-wrapper">
                <select v-model="originalLanguage">
                  <option value="english">English</option>
                  <option value="german">German</option>
                  <option value="french">French</option>
                  <option value="spanish">Spanish</option>
                </select>
              </div>
            </div>
            
            <div class="language-selection-item">
              <label>Translate</label>
              <div class="select-wrapper">
                <select v-model="targetLanguage">
                  <option value="">Choose language to add</option>
                  <option value="english">English</option>
                  <option value="german">German</option>
                  <option value="french">French</option>
                  <option value="italian">Italian</option>
                </select>
              </div>
              <button class="add-language-btn" @click="addLanguage">ADD LANGUAGE</button>
            </div>
          </div>
          
          <div class="input-group">
            <label>Enter the script text here</label>
            <textarea v-model="scriptText" rows="18"></textarea>
          </div>
          
          <div class="button-group">
            <button class="play-btn">Play current file (Alt-P)</button>
            <button class="clear-btn" @click="clearForm">CLICK HERE TO CLEAR THE FORM</button>
          </div>
        </div>
        
        <!-- Right Column -->
        <div class="column right-column">
          <h2>Select voice</h2>
          <p>Select a voice for each language (from the Amazon Web Service catalog.)</p>
          
          <div class="voice-selection">
            <div v-for="(voice, index) in selectedVoices" :key="index" class="voice-option">
              <div class="select-wrapper">
                <select v-model="voice.value">
                  <option value="danielle-en">Danielle-EN</option>
                  <option value="bianca-it">Bianca-IT</option>
                  <option value="hans-de">Hans-DE</option>
                  <option value="celine-fr">Celine-FR</option>
                </select>
              </div>
            </div>
          </div>
          
          <h2>Generate output</h2>
          <button class="generate-btn" @click="generateVoiceover">MAKE VOICEOVER AND SUBTITLES</button>
          
          <div class="disclaimer">
            <h2>Disclaimer</h2>
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VoiceoverAssistant',
  data() {
    return {
      originalLanguage: 'english',
      targetLanguage: '',
      scriptText: '',
      selectedVoices: [
        { value: 'danielle-en' },
        { value: 'bianca-it' }
      ]
    }
  },
  methods: {
    addLanguage() {
      if (this.targetLanguage) {
        // Logic to add a new language would go here
        // For now, we'll just add a new voice selection
        this.selectedVoices.push({ value: '' });
        this.targetLanguage = '';
      }
    },
    clearForm() {
      this.scriptText = '';
      this.originalLanguage = 'english';
      this.targetLanguage = '';
      this.selectedVoices = [
        { value: 'danielle-en' },
        { value: 'bianca-it' }
      ];
    },
    generateVoiceover() {
      // Logic to generate voiceover would go here
      alert('Generating voiceover and subtitles...');
    }
  }
}
</script>

<style>
.voiceover-assistant {
  font-family: Arial, sans-serif;
  color: #333;
  line-height: 1.5;
  max-width: 100%;
  height: 100%;
  margin: 0 auto;
  padding: 0.7rem 0.5rem; /* Responsive padding for top, bottom, left, and right */
  box-sizing: border-box; /* Include padding in height calculation */
  overflow: hidden; /* Prevent scrolling within this div */
}

html, body {
  height: 100%;
  overflow: hidden; /* Prevent scrolling of the entire page */
}

.container {
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  width: 100%;
  height: 100%; /* Ensure the container takes full height */
  overflow: hidden; /* Prevent scrolling within this div */
}

.header {
  padding: 20px;
}

h1 {
  color: #0e8a7d;
  margin: 0 0 10px 0;
  font-size: 24px;
}

.description {
  margin-bottom: 10px;
}

.features {
  margin-bottom: 20px;
}

.main-content {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
}

.column {
  padding: 20px;
  box-sizing: border-box;
}

.left-column {
  flex: 1;
  min-width: 400px; /* Increased minimum width */
}

.right-column {
  flex: 1;
  min-width: 400px; /* Increased minimum width */
  background-color: #f9f9f9; /* Removed gray background */
}

h2 {
  font-size: 18px;
  margin-top: 0;
  margin-bottom: 15px;
}

.input-group {
  margin-bottom: 20px;
}

/* New styles for the language selection row */
.language-selection-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.language-selection-item {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
}

.select-wrapper {
  position: relative;
  margin-bottom: 10px;
}

select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  background-color: white;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 8px center;
  background-size: 16px;
}

textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  resize: vertical;
  box-sizing: border-box;
}

.add-language-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  white-space: nowrap;
  display: block; /* Make button display as block */
  margin-top: 5px; /* Add some space between dropdown and button */
  float: right; /* Align button to the right */
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.play-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}

.clear-btn {
  background-color: #c00;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}

.voice-option {
  margin-bottom: 10px;
}

.generate-btn {
  background-color: #0e8a7d;
  color: white;
  border: none;
  padding: 12px 20px;
  cursor: pointer;
  margin-bottom: 20px;
  font-weight: bold;
}

.disclaimer {
  margin-top: 20px;
  font-size: 14px;
}

.disclaimer ul {
  margin: 0;
  padding-left: 20px;
}

.disclaimer li {
  margin-bottom: 5px;
}

.link {
  color: #0e8a7d;
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .main-content {
    flex-direction: column;
  }
  
  .column {
    width: 100%;
  }
  
  .language-selection-row {
    flex-direction: column;
    gap: 10px;
  }
  
  .button-group {
    flex-direction: column;
  }
}
</style>