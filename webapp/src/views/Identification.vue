<template>
<DefaultLayout>
  <template #header>
    <Hero 
      title="Spot an ALPR"
      description="Visual guide to identifying license plate readers"
      gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
    />
  </template>

  <v-container fluid>
    <!-- Flock Safety - Featured Section -->
    <v-container>
      <v-card class="featured-card" elevation="4">
        <v-card-title class="text-center bg-green text-h4 pt-6 px-6">
          <v-img 
            contain 
            src="/vendor-logos/Flock_Safety_Logo.svg" 
            :alt="'Flock Logo'" 
            style="height: 48px; filter: invert(1);" 
          />
        </v-card-title>
        <v-card-subtitle class="text-center pa-4 text-h6" style="white-space: normal; word-break: break-word;">
          black housing • teardrop shape • usually with solar panels
        </v-card-subtitle>
        <v-card-text class="pa-6">
          <v-row>
            <v-col v-for="(image, index) in flockImages" :key="index" cols="12" sm="6" md="3">
              <v-card class="image-card" elevation="2" @click="openImageInNewTab(image)">
                <v-img 
                  :src="image" 
                  :aspect-ratio="4/3" 
                  cover
                  class="cursor-pointer"
                >
                  <template v-slot:placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary"></v-progress-circular>
                    </v-row>
                  </template>
                </v-img>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Other ALPR Types -->
    <v-container class="mb-12">
      <h2 class="text-center mb-8">Other ALPR Types</h2>
      
      <v-row>
        <v-col cols="12" md="6" v-for="vendor in otherVendors" :key="vendor.vendor" class="mb-4">
          <v-card class="vendor-card h-100" elevation="2">
            <v-card-title class="text-center" style="background-color: #f5f5f5;">
              <v-img v-if="vendor.logoUrl" contain :src="vendor.logoUrl" :alt="`${vendor.vendor} Logo`" style="height: 48px;" />
              <div
                style="height: 48px; display: flex; align-items: center; justify-content: center;"
                class="font-weight-bold text-black"
                v-else
              >
                {{ vendor.vendor }}
              </div>
            </v-card-title>
            <v-card-text class="pa-4">
              <v-row>
                <v-col v-for="(image, index) in vendor.imageUrls" :key="index" cols="6">
                  <v-card class="image-card" elevation="1" @click="openImageInNewTab(image)">
                    <v-img 
                      :src="image" 
                      :aspect-ratio="4/3" 
                      cover
                      class="cursor-pointer"
                    >
                    </v-img>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- What ALPRs are NOT -->
    <v-container class="mb-12">
      <v-card class="not-alpr-card" elevation="3">
        <v-card-title 
          class="text-center px-6 bg-warning font-weight-bold"
          :class="[$vuetify.display.smAndDown ? 'text-h6' : 'text-h4']"
          style="white-space: normal; word-break: break-word;"
        >
          NOT ALPRs
        </v-card-title>
        
        <v-card-text class="px-6 pt-6">
          <v-row>
            <!-- Traffic Detection Cameras -->
            <v-col cols="12" md="9" class="mb-6">
              <h3 class="text-center mb-4">Traffic Detection Cameras</h3>
              <v-row>
              <v-col v-for="(image, index) in trafficCameraImages" :key="index" cols="12" md="4">
                <v-card class="image-card" elevation="1" @click="openImageInNewTab(image)">
                <v-img 
                  :src="image" 
                  :aspect-ratio="4/3" 
                  cover
                  class="cursor-pointer"
                />
                </v-card>
              </v-col>
              </v-row>
            </v-col>

            <!-- Snow Detection Cameras -->
            <v-col cols="12" md="3" class="mb-6">
              <h3 class="text-center mb-4">Snow/Ice Cameras</h3>
              <v-row>
              <v-col v-for="(image, index) in snowDetectionImages" :key="index" cols="12">
                <v-card class="image-card" elevation="1" @click="openImageInNewTab(image)">
                <v-img 
                  :src="image" 
                  :aspect-ratio="4/3" 
                  cover
                  class="cursor-pointer"
                />
                </v-card>
              </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>

    <!-- Action Section -->
    <v-container class="text-center mb-12">
      <v-card class="action-card pa-8" elevation="0" color="transparent">
        <v-card-title class="text-h4 mb-4">Found one?</v-card-title>
        <v-card-text>
          <v-btn 
            size="x-large" 
            color="primary" 
            to="/report"
            variant="elevated"
            class="mr-4"
          >
            <template #prepend>
              <v-icon>
                <MapMarkerPlusIcon />
              </v-icon>
            </template>
            Add to Map
          </v-btn>
        </v-card-text>
      </v-card>
    </v-container>
  </v-container>
</DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import Hero from '@/components/layout/Hero.vue';

import MapMarkerPlusIcon from '@iconify-vue/mdi/map-marker-plus';

function openImageInNewTab(url: string) {
  window.open(url, '_blank');
}

// Flock Safety - Featured prominently
const flockImages = [
  '/alprs/flock-5.webp',
  '/alprs/flock-1.jpg',
  '/alprs/flock-2.jpg', 
  '/alprs/flock-3.jpg',
  '/alprs/flock-4.jpg'
];

// Other ALPR vendors
const otherVendors = [
  {
    vendor: 'Motorola/Vigilant',
    logoUrl: '/vendor-logos/Motorola_Solutions_Logo.svg',
    description: 'Usually dark and rectangular, with visible IR illuminators. Often next to an ugly white box.',
    imageUrls: ['/alprs/motorola-1.jpg', '/alprs/motorola-2.jpg', '/alprs/motorola-3.jpg', '/alprs/motorola-4.jpg']
  },
  {
    vendor: 'Genetec',
    logoUrl: '/vendor-logos/logo_genetec_rgb_color_tm.svg',
    description: 'Usually white and rectangular, with visible IR illuminators',
    imageUrls: ['/alprs/genetec-1.webp', '/alprs/genetec-2.webp', '/alprs/genetec-3.webp']
  },
  {
    vendor: 'Leonardo/ELSAG',
    logoUrl: '/vendor-logos/Logo_Leonardo.svg',
    description: 'Large, highly visible array of IR lights',
    imageUrls: ['/alprs/elsag-3.jpg', '/alprs/elsag-4.jpg', '/alprs/elsag-1.jpg', '/alprs/elsag-2.jpg']
  },
  {
    vendor: 'Neology',
    description: 'Ugly with a white rounded rectangular shape and long hood',
    imageUrls: ['/alprs/neology-1.jpg', '/alprs/neology-2.jpg']
  }
];

const trafficCameraImages = [
  '/non-alprs/iteris.webp',
  '/non-alprs/traffic-cam.webp',
  '/non-alprs/flir.webp',
];

const snowDetectionImages = [
  '/non-alprs/frost-cam.jpeg'
];
</script>

<style scoped>
.featured-card {
  /* border: 3px solid rgb(var(--v-theme-secondary)); */
  margin-bottom: 2rem;
}

.vendor-card {
  transition: transform 0.2s ease-in-out;
}

.vendor-card:hover {
  transform: translateY(-2px);
}

.image-card {
  transition: transform 0.2s ease-in-out;
  cursor: pointer;
}

.image-card:hover {
  transform: scale(1.05);
}

.cursor-pointer {
  cursor: pointer;
}

.overlay-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
}

h1, h2, h3 {
  color: rgb(var(--v-theme-on-surface));
}
</style>