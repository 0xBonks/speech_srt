<template>
  <div>
    <h1>{{ message }}</h1>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'TestComponent',
  data() {
    return {
      message: ''
    }
  },
  async mounted() {
    try {
      const response = await axios.get('http://localhost:5000/api/test');
      this.message = response.data.message;
    } catch (error) {
      console.error('Fehler:', error);
    }
  }
}
</script> 