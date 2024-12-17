<template>
  <v-container class="info-section">
    <!-- Hero Section -->
    <v-row justify="center" class="hero-section-harms text-center mb-4">
      <v-col cols="12" md="8">
        <h1 class="mb-4">The Dangers of ALPRs</h1>
        <p class="mb-4 font-weight-bold bigger">
          ALPRs promise safety but deliver risks to privacy and civil rights.
        </p>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" class="bigger">
        <p class="mb-4">
          Thousands of police departments, homeowners associations, and businesses across the country deploy automated license plate readers (ALPRs) with the expectation that these surveillance tools can reduce crime.
        </p>
        <p>
          In reality, ALPRs pose a real threat to the civil rights, liberties, and safety of the communities of people under surveillance.
        </p>
      </v-col>
    </v-row>
    
    <dangers />
  </v-container>
</template>

<script setup lang="ts">
import Dangers from '@/components/Dangers.vue';
</script>

<style scoped>
.hero-section-harms {
  background: url('/chicago-pd.jpg') no-repeat center center;
  background-size: cover;
  color: white;
  padding: 100px 0 !important;
  position: relative;
  }

 .hero-section-harms::before {
   content: '';
   position: absolute;
   top: 0;
   left: 0;
   width: 100%;
   height: 100%;
   background: rgba(0, 0, 0, 0.5);
   z-index: 1;
 }

 .hero-section-harms > * {
   position: relative;
   z-index: 2;
}

p {
  margin-bottom: 16px;
}

.info-section {
  background: var(--df-page-background-color);
}
</style>
