<template>
  <v-container fluid style="padding: 0;">
    <v-row
      justify="center"
      class="hero text-center mb-4"
      :class="{ 'hero-image': imageUrl }"
      :style="heroStyle"
    >
      <v-col cols="12" md="8">
        <h1 class="mb-4">{{ title }}</h1>
        <p class="mb-4 px-8">
          {{ description }}
        </p>
        <v-btn
          v-if="buttonText"
          :href="buttonHref"
          :to="buttonTo"
          :target
          color="rgb(18, 151, 195)"
          class="mt-4"
        >
          {{ buttonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  title: String,
  description: String,
  imageUrl: String,
  gradient: {
    type: String,
    default: 'linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)',
  },
  buttonText: String,
  buttonTo: String,
  buttonHref: String,
  opacity: {
    type: Number,
    default: 0.6,
  },
  backgroundPosition: {
    type: String,
    default: 'center center',
  },
});

const target = computed(() =>
  props.buttonHref && !props.buttonHref.startsWith('#') ? '_blank' : '_self'
);

const heroStyle = computed(() => (
  props.imageUrl ?
    `background: url('${props.imageUrl}') no-repeat ${props.backgroundPosition} / cover; --hero-opacity: ${props.opacity};` :
    `background: ${props.gradient};`
  ));
</script>

<style scoped>
.hero {
  color: white;
  padding: 35px 0;
  position: relative;
}

.hero-image {
  min-height: 350px;
  padding: 100px 0 !important;
}

/* Overlay for image backgrounds only */
.hero-image::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, var(--hero-opacity));
  z-index: 1;
}

.hero > * {
  position: relative;
  z-index: 2;
}
</style>
