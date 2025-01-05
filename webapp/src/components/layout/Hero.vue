<template>
  <v-container fluid>
    <v-row justify="center" class="hero text-center mb-4" :style="`background: url('${imageUrl}') no-repeat center center / cover;`">
      <v-col cols="12" md="8">
      <h1 class="mb-4">{{ title }}</h1>
      <p class="mb-4">
        {{ description }}
      </p>
      <v-btn v-if="buttonText" :href="buttonHref" :to="buttonTo" :target="buttonHref ? '_blank' : '_self'" color="rgb(18, 151, 195)" class="mt-4">{{ buttonText }}</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
defineProps({
  title: String,
  description: String,
  imageUrl: String,
  buttonText: String,
  buttonTo: String,
  buttonHref: String,
});
</script>

<style scoped>
.hero {
  color: white;
  padding: 100px 0 !important;
  position: relative;
  }

 .hero::before {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.6);
   z-index: 1;
 }

 .hero > * {
   position: relative;
   z-index: 2;
}
</style>
