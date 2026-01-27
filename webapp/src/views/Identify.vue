<template>
<DefaultLayout>
  <template #header>
    <Hero 
      title="How to Identify LPRs"
      description="Visual guide to identifying license plate readers"
      gradient="linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, rgb(var(--v-theme-secondary)) 100%)"
    />
  </template>

  <v-container fluid>
    <v-container>
      <v-expansion-panels>
        <v-expansion-panel elevation="2">
          <v-expansion-panel-title class="text-h5 font-weight-bold">
            Common Features
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list lines="two">
              <v-list-item prepend-icon="mdi-eye">
                <v-list-item-title class="text-h6">Rear-Facing Cameras</v-list-item-title>
                <v-list-item-subtitle>
                  LPRs almost always face the <b>rear of vehicles</b>.
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item prepend-icon="mdi-lightbulb-on">
                <v-list-item-title class="text-h6">Infrared Lights</v-list-item-title>
                <v-list-item-subtitle>
                  Look for infrared lights that emit a <b>faint red glow</b> at night.
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item prepend-icon="mdi-solar-panel">
                <v-list-item-title class="text-h6">Solar Panels</v-list-item-title>
                <v-list-item-subtitle>
                  Many LPRs are powered by nearby <b>solar panels</b>.
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-container>

    <v-container class="mb-12">
      <h2 class="text-h4 text-center mt-3">Common LPR Vendors</h2>
      <p class="text-center text-medium-emphasis mb-8">
        Most LPRs are easy to recognize.
      </p>

      <!-- Skeleton Loader -->
      <v-row v-if="loading">
        <v-col cols="12" md="6" v-for="n in 4" :key="`skeleton-${n}`" class="mb-4">
          <v-card class="vendor-card h-100" elevation="2">
            <v-card-title class="text-center" style="background-color: #f5f5f5;">
              <v-skeleton-loader type="image" style="height:48px; width:150px; margin:0 auto;" />
            </v-card-title>
            <v-card-subtitle class="text-center pa-4">
              <v-skeleton-loader type="text" width="80%" />
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <v-row>
                <v-col cols="6" v-for="i in 4" :key="`skeleton-img-${i}`">
                  <v-skeleton-loader type="image" :height="120" />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-row v-else>
        <v-col cols="12" md="6" v-for="vendor in vendorStore.lprVendors" :key="vendor.id" class="mb-4">
          <v-card class="vendor-card h-100" elevation="2">
            <v-card-title class="text-center" style="background-color: #f5f5f5;">
              <v-img v-if="vendor.logoUrl" contain :src="vendor.logoUrl" :alt="`${vendor.shortName} Logo`" style="height: 48px;" />
              <div
                style="height: 48px; display: flex; align-items: center; justify-content: center;"
                class="font-weight-bold text-black"
                v-else
              >
                {{ vendor.shortName }}
              </div>
            </v-card-title>
            <v-card-subtitle class="text-center pa-4 text-h6" style="white-space: normal; word-break: break-word;">
              {{ vendor.identificationHints }}
            </v-card-subtitle>
            <v-card-text class="pa-4">
              <v-row>
                <v-col v-for="{ url: imageUrl } in vendor.urls" :key="imageUrl" cols="6">
                  <v-card class="image-card" elevation="1" @click="openImageInNewTab(imageUrl)">
                    <v-img 
                      :src="imageUrl" 
                      :aspect-ratio="4/3" 
                      cover
                      class="cursor-pointer"
                    >
                    </v-img>
                  </v-card>
                </v-col>
              </v-row>
              
              <v-divider class="my-4" />
              
              <div class="mt-4">
                <h4 class="text-center mb-2">OSM Tags</h4>
                <DFCode 
                  :osm-tags="getMergedTags(vendor)" 
                  :highlight-values-for-keys="getVendorTagKeys(vendor)"
                />
                <div class="text-center mt-3">
                  <v-btn 
                    color="primary" 
                    variant="elevated"
                    size="large"
                    @click="onAddToApp(vendor)"
                    prepend-icon="mdi-application-import"
                  >
                    Import to App
                  </v-btn>
                </div>
              </div>
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
            prepend-icon="mdi-map-marker-plus"
            variant="elevated"
            class="mr-4"
          >
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
import DFCode from '@/components/DFCode.vue';
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useVendorStore } from '@/stores/vendorStore';
import { createDeflockProfileUrl } from '@/services/deflockAppUrls';
import { lprBaseTags } from '@/constants';
import type { LprVendor } from '@/types';

function openImageInNewTab(url: string) {
  window.open(url, '_blank');
}

const loading = ref(true);
const vendorStore = useVendorStore();

function getMergedTags(vendor: LprVendor): Record<string, string> {
  return { ...lprBaseTags, ...vendor.osmTags };
}

function getVendorTagKeys(vendor: LprVendor): string[] {
  return Object.keys(vendor.osmTags ?? {});
}

onMounted(async () => {
  await vendorStore.loadAllVendors();
  loading.value = false;
});

const router = useRouter();

async function onAddToApp(vendor: LprVendor) {
  const mergedTags = getMergedTags(vendor);
  const url = createDeflockProfileUrl(vendor.shortName, mergedTags);
  const ua = typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '';
  const isMobile = /iphone|ipod|ipad|android|blackberry|bb|playbook|windows phone|iemobile|opera mini|mobile/i.test(ua);
  if (isMobile) {
    try {
      window.location.href = url;
    } catch (e) {
      window.open(url, '_blank');
    }
  } else {
    router.push('/app');
  }
}

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