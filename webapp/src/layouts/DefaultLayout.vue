<template>
  <div class="page-wrapper">
    <slot name="header" />

    <!-- Main content -->
    <main :class="{ 'mb-16': !noBottomMargin }">
      <slot />
    </main>

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from '../components/layout/Footer.vue'

defineProps({
  noBottomMargin: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped>
/* Sticky-footer layout: keeps the footer pinned to the bottom of the
   viewport on short pages (without being fixed/floating), while still
   allowing it to scroll off-screen naturally on taller pages. */
.page-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-wrapper main {

  flex: 1 0 auto;
}
</style>

