<template>
<ifx-navbar  show-logo-and-appname="true" application-name="Application name" fixed="false" logo-href="http://google.com" logo-href-target="_self">
  <ifx-navbar-item icon="undefined" slot="left-item" target="_self" href="" hide-on-mobile="true">
    Menu Item
    <ifx-navbar-item icon="">
      Layer 1 Nested Item 1
      <ifx-navbar-item>
        Layer 2 Nested Item 2
        <ifx-navbar-item href="/" target="_blank">Link Layer 3 Nested Item 1</ifx-navbar-item>
        <ifx-navbar-item>Layer 3 Nested Item 2</ifx-navbar-item>
        <ifx-navbar-item>Layer 3 Nested Item 3</ifx-navbar-item>
        <ifx-navbar-item>Layer 3 Nested Item 4</ifx-navbar-item>
      </ifx-navbar-item>
      <ifx-navbar-item >Layer 2 Nested Item 3</ifx-navbar-item>
      <ifx-navbar-item>Layer 2 Nested Item 4</ifx-navbar-item>
      <ifx-navbar-item>Layer 2 Nested Item 5</ifx-navbar-item>
    </ifx-navbar-item>

    <ifx-navbar-item>
      Layer 1 Nested Item 2
      <ifx-navbar-item>Layer 2 Item 1</ifx-navbar-item>
      <ifx-navbar-item>Layer 2 Item 2</ifx-navbar-item>
      <ifx-navbar-item>Layer 2 Item 3</ifx-navbar-item>
    </ifx-navbar-item>

    <ifx-navbar-item>Nested Item 3</ifx-navbar-item>

    <ifx-navbar-item>
      Layer 1 Nested Item 4
      <ifx-navbar-item>Nested Item 4</ifx-navbar-item>
    </ifx-navbar-item>

  </ifx-navbar-item>

  <ifx-navbar-item href="" target="_self" slot="left-item" icon="" show-label="true">
    Menu Item
  </ifx-navbar-item>

  <ifx-navbar-item slot="left-item">
    More
    <ifx-navbar-item>Item1</ifx-navbar-item>
    <ifx-navbar-item>Item2</ifx-navbar-item>
  </ifx-navbar-item>

  <ifx-search-bar slot="search-bar-left" is-open="false"></ifx-search-bar>

  <ifx-navbar-item number-indicator="" slot="right-item" target="_blank" href="http://google.com" hide-on-mobile="true" show-label="false" icon="image-16">
  </ifx-navbar-item>
  <ifx-navbar-item dot-indicator="false" slot="right-item" hide-on-mobile="true" show-label='false' icon="image-16">
  </ifx-navbar-item>

  <ifx-navbar-profile user-name="" slot="right-item" image-url="" show-label="true" href="" target="_self" alt="profile image"></ifx-navbar-profile>
</ifx-navbar>
</template>

<script setup>
</script>


 