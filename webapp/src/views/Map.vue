<template>
  <NewVisitor />
  <div class="map-container" @keyup="handleKeyUp">
    <leaflet-map
      v-if="center"
      v-model:center="center"
      v-model:zoom="zoom"
      :current-location="currentLocation"
      @update:bounds="updateBounds"
      :alprs
      :geojson
    >
      <!-- SEARCH -->
      <template v-slot:topleft>
        <form @submit.prevent="onSearch">
          <v-text-field
            :rounded="xs || undefined"
            :density="xs ? 'compact' : 'default'"
            class="map-search"
            ref="searchField"
            prepend-inner-icon="mdi-magnify"
            placeholder="Search for a location"
            single-line
            variant="solo"
            clearable
            hide-details
            v-model="searchQuery"
            type="search"
          >
            <template v-slot:append-inner>
              <v-btn :disabled="!searchQuery" variant="text" flat color="#0080BC" @click="onSearch">
                Go<v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </form>
      </template>

      <!-- CURRENT LOCATION -->
      <template v-slot:bottomright>
        <v-fab icon="mdi-crosshairs-gps" @click="goToUserLocation" />
      </template>
    </leaflet-map>
    <div v-else class="loader">
      <span class="mb-4 text-grey">Loading Map</span>
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router'
import type { Ref } from 'vue';
import { BoundingBox } from '@/services/apiService';
import { geocodeQuery } from '@/services/apiService';
import { useDisplay, useTheme } from 'vuetify';
import { useGlobalStore } from '@/stores/global';
import { useTilesStore } from '@/stores/tiles';
import L from 'leaflet';
globalThis.L = L;
import 'leaflet/dist/leaflet.css'
import LeafletMap from '@/components/LeafletMap.vue';
import NewVisitor from '@/components/NewVisitor.vue';

const DEFAULT_ZOOM = 12;

const zoom: Ref<number> = ref(DEFAULT_ZOOM);
const center: Ref<any|null> = ref(null);
const bounds: Ref<BoundingBox|null> = ref(null);
const searchField: Ref<any|null> = ref(null);
const searchQuery: Ref<string> = ref('');
const geojson: Ref<GeoJSON.GeoJsonObject | null> = ref(null);
const tilesStore = useTilesStore();

const { fetchVisibleTiles } = tilesStore;
const alprs = computed(() => tilesStore.allNodes);

const router = useRouter();
const { xs } = useDisplay();

const globalStore = useGlobalStore();

const setCurrentLocation = globalStore.setCurrentLocation;
const currentLocation = computed(() => globalStore.currentLocation);

function handleKeyUp(event: KeyboardEvent) {
  if (event.key === '/' && searchField.value.value !== document.activeElement) {
    searchField.value.focus();
    event.preventDefault();
  }
}

function onSearch() {
  searchField.value?.blur();
  if (!searchQuery.value) {
    return;
  }
  geocodeQuery(searchQuery.value, center.value)
    .then((result: any) => {
      if (!result) {
        alert('No results found');
        return;
      }
      const { lat, lon: lng } = result;
      center.value = { lat, lng };
      zoom.value = DEFAULT_ZOOM;
      geojson.value = result.geojson;
      searchQuery.value = '';
    });
}

function goToUserLocation() {
  setCurrentLocation()
    .then((cl) => {
      center.value = cl;
      setTimeout(() => {
        zoom.value = DEFAULT_ZOOM;
      }, 10);
    })
    .catch(error => {
      console.debug('Error getting user location.', error);
    });
}

function updateBounds(newBounds: any) {
  updateURL();
  
  const newBoundingBox = new BoundingBox({
    minLat: newBounds.getSouth(),
    maxLat: newBounds.getNorth(),
    minLng: newBounds.getWest(),
    maxLng: newBounds.getEast(),
  });
  bounds.value = newBoundingBox;

  updateMarkers();
}

function updateURL() {
  if (!center.value) {
    return;
  }

  const currentRoute = router.currentRoute.value;
  const newHash = `#map=${zoom.value}/${center.value.lat.toFixed(6)}/${center.value.lng.toFixed(6)}`;

  router.replace({
    path: currentRoute.path,
    query: currentRoute.query,
    hash: newHash,
  });
}

function updateMarkers() {
  // Fetch ALPRs in the current view
  if (!bounds.value) {
    return;
  }

  fetchVisibleTiles(bounds.value);
}

onMounted(() => {
  const hash = router.currentRoute.value.hash;
  if (hash) {
    const parts = hash.split('/');
    if (parts.length === 3 && parts[0].startsWith('#map')) {
      const zoomLevelString = parts[0].replace('#map=', '');
      zoom.value = parseInt(zoomLevelString, 10);
      center.value = {
        lat: parseFloat(parts[1]),
        lng: parseFloat(parts[2]),
      };
    }
  } else {
    // show US map by default
    zoom.value = 5;
    center.value = { lat: 39.8283, lng: -98.5795 };
  }
});

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0;
}

.map-container {
  width: 100%;
  overflow: auto;
}

.map-search {
  width: calc(100vw - 22px);
  @media (min-width: 600px) {
    max-width: 320px;
  }
  z-index: 1000;
}

.map-notif {
  position: absolute;
  text-align: center;
  bottom: 50%;
  left: 50%;
  transform: translate(-50%, 50%);
  z-index: 1000;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 4px;
  padding: 20px;
}

.loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #333;
}
</style>
