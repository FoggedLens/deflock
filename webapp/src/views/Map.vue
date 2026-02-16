<template>
  <NewVisitor v-if="!isIframe" />
  <ShareDialog v-model="shareDialogOpen" />
  
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
            v-model="searchInput"
            type="search"
          >
            <template v-slot:append-inner>
              <v-btn :disabled="!searchInput" variant="text" flat color="#0080BC" @click="onSearch">
                Go<v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </form>
      </template>

      <template v-slot:bottomright>
        <v-btn icon @click="shareDialogOpen = true" v-if="!isIframe">
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-btn icon to="/report" style="color: unset" v-if="!isIframe">
          <v-icon size="large">mdi-map-marker-plus</v-icon>
        </v-btn>
        <v-btn icon @click="goToUserLocation">
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'
import type { Ref } from 'vue';
import { BoundingBox } from '@/services/apiService';
import { geocodeQuery } from '@/services/apiService';
import { useDisplay } from 'vuetify';
import { useGlobalStore } from '@/stores/global';
import { useTilesStore } from '@/stores/tiles';
import { useVendorStore } from '@/stores/vendorStore';
import L from 'leaflet';
globalThis.L = L;
import 'leaflet/dist/leaflet.css'
import LeafletMap from '@/components/LeafletMap.vue';
import NewVisitor from '@/components/NewVisitor.vue';
import ShareDialog from '@/components/ShareDialog.vue';

const DEFAULT_ZOOM = 12;

const zoom: Ref<number> = ref(DEFAULT_ZOOM);
const center: Ref<any|null> = ref(null);
const bounds: Ref<BoundingBox|null> = ref(null);
const searchField: Ref<any|null> = ref(null);
const searchInput: Ref<string> = ref(''); // For the text input field
const searchQuery: Ref<string> = ref(''); // For URL and boundaries (persistent)
const geojson: Ref<GeoJSON.GeoJsonObject | null> = ref(null);
const shareDialogOpen = ref(false);
const tilesStore = useTilesStore();

const isIframe = computed(() => window.self !== window.top);

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
  if (!searchInput.value) {
    return;
  }
  geocodeQuery(searchInput.value)
    .then((result: any) => {
      if (!result) {
        alert('No results found');
        return;
      }
      const { lat, lon: lng } = result;
      center.value = { lat: parseFloat(lat), lng: parseFloat(lng) };
      
      // If we have GeoJSON with bounds, zoom to fit the bounds
      if (result.geojson) {
        geojson.value = result.geojson;
        
        // Calculate bounds from GeoJSON to zoom to fit
        const geoJsonLayer = L.geoJSON(result.geojson);
        const bounds = geoJsonLayer.getBounds();
        
        setTimeout(() => {
          const latDiff = bounds.getNorth() - bounds.getSouth();
          const lngDiff = bounds.getEast() - bounds.getWest();
          const maxDiff = Math.max(latDiff, lngDiff);
          
          // Rough zoom calculation based on bounds size
          if (maxDiff > 10) zoom.value = 6;
          else if (maxDiff > 5) zoom.value = 7;
          else if (maxDiff > 2) zoom.value = 8;
          else if (maxDiff > 1) zoom.value = 9;
          else if (maxDiff > 0.5) zoom.value = 10;
          else if (maxDiff > 0.2) zoom.value = 11;
          else zoom.value = DEFAULT_ZOOM;
        }, 100);
      } else {
        // No bounds, just use default zoom
        zoom.value = DEFAULT_ZOOM;
      }
      
      searchQuery.value = searchInput.value; // Store the successful search query
      updateURL();
      searchInput.value = ''; // Clear the input field
    });
}

function goToUserLocation() {
  setCurrentLocation()
    .then((cl) => {
      center.value = cl;
      setTimeout(() => {
        zoom.value = DEFAULT_ZOOM;
        updateURL();
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
  // URL encode searchQuery.value
  const encodedSearchValue = searchQuery.value ? encodeURIComponent(searchQuery.value) : null;
  
  const baseHash = `#map=${zoom.value}/${center.value.lat.toFixed(6)}/${center.value.lng.toFixed(6)}`;
  const maybeSuffix = encodedSearchValue ? `/${encodedSearchValue}` : '';
  const newHash = baseHash + maybeSuffix;

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
  // Expected hash format like #map=<ZOOM_LEVEL:int>/<LATITUDE:float>/<LONGITUDE:float>/<QUERY:text>
  const hash = router.currentRoute.value.hash;
  if (hash) {
    const parts = hash.split('/');
    if (parts.length >= 3 && parts[0].startsWith('#map')) {
      const zoomLevelString = parts[0].replace('#map=', '');
      zoom.value = parseInt(zoomLevelString, 10);
      center.value = {
        lat: parseFloat(parts[1]),
        lng: parseFloat(parts[2]),
      };
      if (parts.length >= 4 && parts[3]) {
        searchQuery.value = decodeURIComponent(parts[3]);
        searchInput.value = searchQuery.value; // Populate input field with URL search query
        onSearch()
      }
    }
  } else {
    // show US map by default
    zoom.value = 5;
    center.value = { lat: 39.8283, lng: -98.5795 };
  }

  // Cache vendors for displaying images on the map
  const vendorStore = useVendorStore();
  vendorStore.loadAllVendors();
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
