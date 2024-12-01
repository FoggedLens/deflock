<template>
    <v-container max-width="1000">
      <h1>Welcome to DeFlock</h1>
      <p>
        You found an Automated License Plate Reader (ALPR) camera! These cameras capture images of all passing license plates, storing details like the car's location, date, and time. They collect data on millions of vehicles—regardless of whether the driver is suspected of a crime.
      </p>
      <v-btn @click="goToMap" color="primary" variant="elevated">Get Location Info</v-btn>
      <v-alert v-if="error" type="error" class="mt-4">{{ error }}</v-alert>
    </v-container>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getALPRs } from '@/services/apiService';
  
  const router = useRouter();
  const error = ref<string | null>(null);
  
  function goToMap() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          router.push({ path: '/', hash: `#map=12/${latitude}/${longitude}` });
        },
        (err) => {
          error.value = 'Unable to retrieve your location. Please try again.';
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    } else {
      error.value = 'Geolocation is not supported by this browser.';
    }
  }
  </script>
  
  <style scoped>
  h1 {
    margin-top: 2rem;
  }
  
  p {
    margin-top: 0.5rem;
  }
  </style>