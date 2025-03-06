<template>
  <div class="user-component">
    <!-- Benutzer-Formular -->
    <div class="user-form">
      <h2>Neuen Benutzer anlegen</h2>
      <form @submit.prevent="createUser">
        <div>
          <label>Name:</label>
          <input v-model="newUser.name" required>
        </div>
        <div>
          <label>Email:</label>
          <input v-model="newUser.email" type="email" required>
        </div>
        <button type="submit">Benutzer anlegen</button>
      </form>
    </div>

    <!-- Benutzer-Liste -->
    <div class="user-list">
      <h2>Benutzerliste</h2>
      <ul>
        <li v-for="user in users" :key="user.id">
          {{ user.name }} ({{ user.email }})
          <button @click="loadUserDetails(user.id)">Details</button>
        </li>
      </ul>
    </div>

    <!-- Benutzer-Details -->
    <div v-if="selectedUser" class="user-details">
      <h2>Benutzer Details</h2>
      <p>ID: {{ selectedUser.id }}</p>
      <p>Name: {{ selectedUser.name }}</p>
      <p>Email: {{ selectedUser.email }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserComponent',
  data() {
    return {
      users: [],
      selectedUser: null,
      newUser: {
        name: '',
        email: ''
      }
    }
  },
  methods: {
    async loadUsers() {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        this.users = response.data;
      } catch (error) {
        console.error('Fehler beim Laden der Benutzer:', error);
      }
    },
    async loadUserDetails(id) {
      try {
        const response = await axios.get(`http://localhost:5000/api/users/${id}`);
        this.selectedUser = response.data;
      } catch (error) {
        console.error('Fehler beim Laden der Benutzerdetails:', error);
      }
    },
    async createUser() {
      try {
        await axios.post('http://localhost:5000/api/users', this.newUser);
        // Formular zurücksetzen
        this.newUser = { name: '', email: '' };
        // Liste aktualisieren
        await this.loadUsers();
      } catch (error) {
        console.error('Fehler beim Erstellen des Benutzers:', error);
      }
    }
  },
  mounted() {
    this.loadUsers();
  }
}
</script>

<style scoped>
.user-component {
  padding: 20px;
}

.user-form, .user-list, .user-details {
  margin-bottom: 20px;
}

form div {
  margin-bottom: 10px;
}

label {
  margin-right: 10px;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  margin-bottom: 5px;
}

button {
  margin-left: 10px;
}
</style> 