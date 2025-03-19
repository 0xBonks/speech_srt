<template>
  <div>
    <ifx-navbar show-logo-and-appname="false" application-name="Voiceover Assistant" fixed="false" logo-href="/" logo-href-target="_self">
    <ifx-navbar-item slot="left-item">
      <router-link to="/product-overview" class="nav-link">Product Overview</router-link>
    </ifx-navbar-item>

    <ifx-navbar-item slot="left-item">
      <router-link to="/contacts" class="nav-link">Contacts</router-link>
    </ifx-navbar-item>

    <ifx-navbar-item slot="left-item">
      <router-link to="/faq" class="nav-link">FAQ</router-link>
    </ifx-navbar-item>

    <ifx-navbar-item slot="left-item">
      <router-link to="/instructions" class="nav-link">Instructions</router-link>
    </ifx-navbar-item>

    <ifx-navbar-profile slot="right-item" image-url="https://i.pinimg.com/originals/82/d4/92/82d4926dcf09dd4c73eb1a6c0300c135.jpg" show-label="true" href="" target="_blank">
      Name nutzer
      <ifx-navbar-item>Logout</ifx-navbar-item>
    </ifx-navbar-profile>
  </ifx-navbar>
  </div>
</template>

<script setup>
</script>

<style scoped>
.nav-link {
  text-decoration: none;
  color: inherit;
}
</style>


 