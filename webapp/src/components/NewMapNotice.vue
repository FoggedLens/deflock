<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <v-card>
      <v-btn icon variant="text" size="small" @click="dismiss" style="position: absolute; top: 10px; right: 10px;">
        <v-icon>mdi-close</v-icon>
      </v-btn>
      <v-card-title class="text-center py-4 font-weight-bold">
        <h3 class="headline">Try Our New Map</h3>
      </v-card-title>
      <v-card-text>
        <v-img src="/new-df-map.webp" alt="New Map" contain max-width="500" class="mx-auto mb-4 w-full rounded" />
        <v-list density="compact" class="py-0">
          <v-list-item prepend-icon="mdi-lightning-bolt">Faster Performance</v-list-item>
          <v-list-item prepend-icon="mdi-routes">ALPR-Avoidance Routing</v-list-item>
          <v-list-item prepend-icon="mdi-share-variant">Network Sharing</v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions class="flex-column px-4 pb-4 gap-2">
        <v-btn
          block
          size="large"
          color="rgb(18, 151, 195)"
          variant="elevated"
          :href="newMapUrl"
          @click="goToNewMap"
        >
          Continue in New Map
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

const STORAGE_KEY = 'new-map-notice-dismissed';

const comingFromNewMap = document.referrer.includes('maps.deflock.org');
const show = ref(false);

onMounted(() => {
  if (!comingFromNewMap && !localStorage.getItem(STORAGE_KEY)) {
    show.value = true;
  }
});

const newMapUrl = computed(() => {
  const hash = window.location.hash;
  const match = hash.match(/^#map=([\d.]+)\/([-\d.]+)\/([-\d.]+)/);
  if (match) {
    const zoom = parseFloat(match[1]).toFixed(2);
    const lat = match[2];
    const lng = match[3];
    return `https://maps.deflock.org/?lat=${lat}&lng=${lng}&zoom=${zoom}`;
  }
  return 'https://maps.deflock.org';
});

function dismiss() {
  show.value = false;
  localStorage.setItem(STORAGE_KEY, 'true');
}

function goToNewMap() {
  localStorage.setItem(STORAGE_KEY, 'true');
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
