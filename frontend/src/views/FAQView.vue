<template>
  <div class="faq-view">
    <h1>Frequently Asked Questions</h1>
    <p>Find answers to common questions about our Voiceover Assistant.</p>
    
    <div class="faq-content">
      <ifx-accordion class="faq-item">
        <ifx-accordion-item title="How do I create a new voiceover project?">
          <p>
            To create a new voiceover project, click the "New Project" button on the dashboard and follow the setup wizard.
            You can import text directly or type your script into the editor.
          </p>
        </ifx-accordion-item>
        
        <ifx-accordion-item title="Which file formats are supported for export?">
          <p>
            The Voiceover Assistant supports exporting to MP3, WAV, OGG, and FLAC formats. You can choose your preferred
            format in the export settings dialog.
          </p>
        </ifx-accordion-item>
        
        <ifx-accordion-item title="How many languages are supported?">
          <p>
            Currently, the Voiceover Assistant supports 25 languages, including English, German, French, Spanish,
            Chinese, Japanese, and many more. We're continuously adding support for additional languages.
          </p>
        </ifx-accordion-item>
        
        <ifx-accordion-item title="Can I customize the voice properties?">
          <p>
            Yes, you can adjust pitch, speed, tone, and emphasis for any voice. Premium users can also create custom
            voice profiles that can be saved and reused across projects.
          </p>
        </ifx-accordion-item>
        
        <ifx-accordion-item title="What are the system requirements?">
          <p>
            The Voiceover Assistant works in any modern web browser. For optimal performance, we recommend using the
            latest version of Chrome, Firefox, or Edge with at least 4GB of RAM.
          </p>
        </ifx-accordion-item>
      </ifx-accordion>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.faq-view {
  padding: 20px;
}

.faq-content {
  margin-top: 30px;
  max-width: 800px;
}

.faq-item {
  margin-bottom: 8px;
}
</style> 