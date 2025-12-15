<template>
  <v-container fluid style="padding: 0;">
    <v-row
      justify="center"
      class="hero text-center mb-4"
      :class="{ 'hero-image': imageUrl, 'hero-gradient': gradient }"
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
  gradient: String,
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

const heroStyle = computed(() => {
  if (props.gradient) {
    return `background: ${props.gradient};`;
  } else if (props.imageUrl) {
    return `background: url('${props.imageUrl}') no-repeat ${props.backgroundPosition} / cover; --hero-opacity: ${props.opacity};`;
  }
  return '';
});
</script>

<style scoped>
.hero {
  color: white;
  padding: 100px 0 !important;
  position: relative;
  min-height: 350px;
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
