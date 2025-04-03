<template>
  <div class="app-container">
    <div class="main-content">
      <Navbar/>
      <div class="content-area">
        <!-- Hier kann jetzt direkt der Inhalt eingefügt werden -->
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue'
</script>

<style>
*{
  font-family: "Source Sans 3", "sans-serif";
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
</style>