<template>
  <div class="instructions-view">
    <h1>Instructions</h1>
    <p>Learn how to use the Voiceover Assistant with these step-by-step instructions.</p>
    
    <div class="instructions-content">
      <ifx-tabs>
        <ifx-tab-panel title="Getting Started">
          <div class="instruction-section">
            <h2>Getting Started</h2>
            <p>Welcome to the Voiceover Assistant! Follow these steps to begin creating your first voiceover:</p>
            
            <ifx-stepper orientation="vertical" class="instruction-steps">
              <ifx-step title="Create an Account" description="Sign up using your email address or Google account"></ifx-step>
              <ifx-step title="Create a New Project" description="Click the '+' button on the dashboard"></ifx-step>
              <ifx-step title="Import or Create Your Script" description="Enter your text or import from a document"></ifx-step>
              <ifx-step title="Select a Voice" description="Choose from our library of natural-sounding voices"></ifx-step>
              <ifx-step title="Preview and Adjust" description="Listen to your voiceover and make adjustments as needed"></ifx-step>
              <ifx-step title="Export" description="Download your voiceover in your preferred format"></ifx-step>
            </ifx-stepper>
          </div>
        </ifx-tab-panel>
        
        <ifx-tab-panel title="Voice Settings">
          <div class="instruction-section">
            <h2>Voice Settings</h2>
            <p>Learn how to customize voice settings to create the perfect voiceover:</p>
            
            <ul class="settings-list">
              <li>
                <strong>Pitch Adjustment:</strong> Use the slider to make the voice higher or lower pitched.
              </li>
              <li>
                <strong>Speed Control:</strong> Adjust how quickly or slowly the voice speaks.
              </li>
              <li>
                <strong>Tone:</strong> Modify the emotional tone of the voice from neutral to expressive.
              </li>
              <li>
                <strong>Emphasis:</strong> Set which words should receive special emphasis in the speech.
              </li>
              <li>
                <strong>Pauses:</strong> Add natural-sounding pauses between sentences or paragraphs.
              </li>
            </ul>
          </div>
        </ifx-tab-panel>
        
        <ifx-tab-panel title="Advanced Features">
          <div class="instruction-section">
            <h2>Advanced Features</h2>
            <p>Explore these advanced features to get the most out of your Voiceover Assistant:</p>
            
            <div class="advanced-features">
              <div class="feature">
                <h3>Voice Cloning</h3>
                <p>Create a digital copy of your own voice by providing voice samples.</p>
              </div>
              
              <div class="feature">
                <h3>Batch Processing</h3>
                <p>Convert multiple text files to voiceovers simultaneously.</p>
              </div>
              
              <div class="feature">
                <h3>API Integration</h3>
                <p>Integrate voiceover capabilities into your own applications.</p>
              </div>
              
              <div class="feature">
                <h3>Collaboration</h3>
                <p>Share projects with team members and work together in real-time.</p>
              </div>
            </div>
          </div>
        </ifx-tab-panel>
      </ifx-tabs>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.instructions-view {
  padding: 20px;
}

.instructions-content {
  margin-top: 20px;
}

.instruction-section {
  margin: 20px 0;
  max-width: 800px;
}

.instruction-steps {
  margin: 20px 0;
}

.settings-list {
  margin: 20px 0;
  line-height: 1.8;
}

.advanced-features {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature {
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
}
</style> 