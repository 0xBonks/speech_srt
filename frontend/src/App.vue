<template>
  <div class="app-container">
    <Sidebar class="sidebar" />
    <div class="right-content">
      <Navbar class="navbar" />
      <div class="content-area">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from './components/Sidebar.vue'
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

.sidebar {
  height: 100vh;
}

.right-content {
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
