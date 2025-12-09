<template>
  <DefaultLayout>
    <div class="text-center">
      <h1>Page Not Found</h1>

      <div class="mt-8 mb-16">
        <v-img height="300" src="/404.webp" />
        <p class="caption">... just like the license plate this guy is searching for.</p>
      </div>

      <v-btn color="primary" to="/"><v-icon start>
        <HomeIcon />
      </v-icon>Home</v-btn>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import HomeIcon from '@iconify-vue/mdi/home';
</script>

<style scoped>
.caption {
  font-size: 1.2rem;
  color: var(--v-theme-on-surface);
}
</style>
