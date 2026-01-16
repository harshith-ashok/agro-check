<script setup lang="ts">
// App.vue serves as the root component
// All routing is handled through router-view
</script>

<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style>
/* Minimal global styles - Tailwind handles the rest */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>