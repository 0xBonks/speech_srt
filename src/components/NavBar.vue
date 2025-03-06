<template>
  <div class="header-container">
    <ifx-navbar 
      show-logo-and-appname="true" 
      application-name="Speech SRT API" 
      fixed="false" 
      logo-href="/" 
      logo-href-target="_self"
    >
      <!-- Linke Menüitems -->
      <ifx-navbar-item 
        icon="test16" 
        slot="left-item"
        hover-trigger="true"
      >
        Tests
        <ifx-navbar-item 
          href="#" 
          @click="checkStatus" 
          slot="first__layer"
          icon="check16"
        >
          Status prüfen
        </ifx-navbar-item>
        <ifx-navbar-item 
          href="#" 
          @click="testPolly" 
          slot="first__layer"
          icon="sound16"
        >
          AWS Polly testen
        </ifx-navbar-item>
        <ifx-navbar-item 
          href="#" 
          @click="testTranslator" 
          slot="first__layer"
          icon="translate16"
        >
          Übersetzer testen
        </ifx-navbar-item>
      </ifx-navbar-item>

      <ifx-navbar-item 
        href="/docs" 
        target="_blank" 
        slot="left-item" 
        icon="document16"
      >
        Dokumentation
      </ifx-navbar-item>

      <!-- Rechte Menüitems -->
      <ifx-navbar-item 
        slot="right-item" 
        icon="github16"
        href="https://github.com/yourusername/speech-srt" 
        target="_blank"
        hide-on-mobile="false"
        show-label="true"
      >
        GitHub
      </ifx-navbar-item>

      <!-- Benutzer-Profil -->
      <ifx-navbar-profile 
        slot="right-item" 
        show-label="true"
      >
        Benutzer
        <ifx-navbar-item slot="first__layer">Profil</ifx-navbar-item>
        <ifx-navbar-item slot="first__layer">Einstellungen</ifx-navbar-item>
        <ifx-navbar-item slot="first__layer">Abmelden</ifx-navbar-item>
      </ifx-navbar-profile>
    </ifx-navbar>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      statusResult: ''
    }
  },
  methods: {
    async checkStatus() {
      try {
        const response = await fetch('/api/status');
        const data = await response.json();
        this.$emit('update-status', JSON.stringify(data, null, 2));
      } catch (error) {
        this.$emit('update-status', `Fehler: ${error.message}`);
      }
    },
    async testPolly() {
      try {
        this.$emit('update-status', "Teste AWS Polly Verbindung...");
        const response = await fetch('/api/test-polly', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await response.json();
        this.$emit('update-status', `AWS Polly Test: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        this.$emit('update-status', `Fehler beim Testen von AWS Polly: ${error.message}`);
      }
    },
    async testTranslator() {
      try {
        this.$emit('update-status', "Teste Übersetzer Verbindung...");
        const response = await fetch('/api/test-translator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        const data = await response.json();
        this.$emit('update-status', `Übersetzer Test: ${JSON.stringify(data, null, 2)}`);
      } catch (error) {
        this.$emit('update-status', `Fehler beim Testen des Übersetzers: ${error.message}`);
      }
    }
  },
  emits: ['update-status']
}
</script>

<style scoped>
.header-container {
  width: 100%;
  z-index: 100;
}
</style> 