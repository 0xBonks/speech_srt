<template>
  <div class="help-container">
    <div class="contact-card">
      <h1>Contact Information</h1>
      
      <div class="contact-item">
        <div class="icon-container">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="#007BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M22 6L12 13L2 6" stroke="#007BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="contact-info">
          <span class="contact-label">Email:</span>
          <a href="mailto:Johannes.bauersachs@infineon.com" class="contact-value">Johannes.bauersachs@infineon.com</a>
        </div>
      </div>
      
      <div class="contact-item">
        <div class="icon-container">
          <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#007BFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="7" cy="10" r="1" fill="#007BFF"/>
            <circle cx="12" cy="10" r="1" fill="#007BFF"/>
            <circle cx="17" cy="10" r="1" fill="#007BFF"/>
          </svg>
        </div>
        <div class="contact-info">
          <span class="contact-label">WebEx:</span>
          <span class="contact-value">Johannes Bauersachs</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>

<style scoped>
.help-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.contact-card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 30px;
  width: 100%;
  max-width: 500px;
  text-align: center;
}

h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  border-bottom: 2px solid #eee;
  padding-bottom: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 25px;
  padding: 15px;
  border-radius: 8px;
  background-color: #f8f9fa;
  transition: transform 0.2s, box-shadow 0.2s;
}

.contact-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  background-color: #e6f2ff;
  border-radius: 50%;
  margin-right: 15px;
  flex-shrink: 0;
}

.icon {
  width: 24px;
  height: 24px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
}

.contact-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.contact-value {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

a.contact-value {
  color: #007bff;
  text-decoration: none;
}

a.contact-value:hover {
  text-decoration: underline;
}
</style>
