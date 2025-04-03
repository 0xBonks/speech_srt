<template>
  <ifx-card>
    <h3 slot="header">Contact {{ contactId }}</h3>
    <div slot="content">
      <p>Name: Sample User {{ contactId }}</p>
      <p>Email: user{{ contactId }}@example.com</p>
      <p>Phone: +1 555-123-456{{ contactId }}</p>
    </div>
    <ifx-button slot="footer" variant="primary">Contact</ifx-button>
  </ifx-card>
</template>

<script setup>
defineProps({
  contactId: Number,
});
</script>