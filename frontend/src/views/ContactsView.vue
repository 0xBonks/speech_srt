<template>
  <div class="contacts-view">
    <h1>Contacts</h1>
    <p>This is the Contacts page content.</p>
    <div class="contacts-container">
      <ContactCard v-for="i in 3" :key="i" :contact-id="i" />
    </div>
  </div>
</template>

<script setup>
import ContactCard from '@/components/ContactCard.vue';
</script>

<style scoped>
.contacts-view {
  padding: 20px;
}

.contacts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}
</style>