<template>
  <ShareDialog v-model="shareDialogOpen" />
  
  <div class="map-container" @keyup="handleKeyUp">
    <leaflet-map
      v-if="center"
      ref="leafletMap"
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
            aria-label="Search for a location"
            single-line
            variant="solo"
            clearable
            hide-details
            v-model="searchInput"
            type="search"
          >
            <template v-slot:append-inner>
              <v-btn aria-label="Search" :disabled="!searchInput" variant="text" flat color="#0080BC" @click="onSearch">
                Go<v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </form>
      </template>

      <template v-slot:bottomright>
        <v-btn
          icon
          :aria-label="cameraListOpen ? 'Hide cameras in current map view' : 'Show cameras in current map view'"
          aria-controls="camera-list-panel"
          :aria-expanded="cameraListOpen"
          @click="cameraListOpen = !cameraListOpen"
        >
          <v-icon>mdi-format-list-bulleted</v-icon>
        </v-btn>
        <v-btn icon aria-label="Share map" @click="shareDialogOpen = true" v-if="!isIframe">
          <v-icon>mdi-share-variant</v-icon>
        </v-btn>
        <v-btn icon aria-label="Report a camera" to="/report" style="color: unset" v-if="!isIframe">
          <v-icon size="large">mdi-map-marker-plus</v-icon>
        </v-btn>
        <v-btn icon aria-label="Go to my location" @click="goToUserLocation">
          <v-icon>mdi-crosshairs-gps</v-icon>
        </v-btn>

        <section
          v-if="cameraListOpen"
          id="camera-list-panel"
          class="camera-list-panel"
          aria-labelledby="camera-list-heading"
        >
          <h2 id="camera-list-heading" class="camera-list-heading">Cameras in current map view</h2>
          <p class="camera-list-status" aria-live="polite">
            {{ visibleCameras.length }} {{ visibleCameras.length === 1 ? 'camera' : 'cameras' }} found.
            Page {{ cameraPage }} of {{ cameraPageCount }}.
          </p>

          <ul v-if="paginatedCameras.length" class="camera-list">
            <li v-for="camera in paginatedCameras" :key="camera.id" class="camera-list-item">
              <span>{{ cameraAriaLabel(camera) }}</span>
              <v-btn
                size="small"
                variant="outlined"
                :aria-label="`Show on map: ${cameraAriaLabel(camera)}`"
                @click="showCameraOnMap(camera.id)"
              >
                Show on map
              </v-btn>
            </li>
          </ul>
          <p v-else class="camera-list-empty">No cameras are visible in the current map view.</p>

          <nav class="camera-list-pagination" aria-label="Camera list pages">
            <v-btn
              size="small"
              variant="text"
              :disabled="cameraPage <= 1"
              aria-label="Previous camera list page"
              @click="cameraPage--"
            >
              Previous
            </v-btn>
            <span aria-current="page">Page {{ cameraPage }} of {{ cameraPageCount }}</span>
            <v-btn
              size="small"
              variant="text"
              :disabled="cameraPage >= cameraPageCount"
              aria-label="Next camera list page"
              @click="cameraPage++"
            >
              Next
            </v-btn>
          </nav>
        </section>
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
import { useHead } from '@unhead/vue'

useHead({
  link: [{ rel: 'canonical', href: 'https://maps.deflock.org' }],
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
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
import ShareDialog from '@/components/ShareDialog.vue';
import { cameraAriaLabel, filterCamerasInBounds, paginateCameras } from '@/components/mapAccessibility';

const DEFAULT_ZOOM = 12;
const CAMERA_PAGE_SIZE = 25;

interface LeafletMapExposed {
  openCamera(id: string): boolean;
}

const zoom: Ref<number> = ref(DEFAULT_ZOOM);
const center: Ref<any|null> = ref(null);
const bounds: Ref<BoundingBox|null> = ref(null);
const searchField: Ref<any|null> = ref(null);
const searchInput: Ref<string> = ref(''); // For the text input field
const searchQuery: Ref<string> = ref(''); // For URL and boundaries (persistent)
const geojson: Ref<GeoJSON.GeoJsonObject | null> = ref(null);
const shareDialogOpen = ref(false);
const leafletMap = ref<LeafletMapExposed | null>(null);
const cameraListOpen = ref(false);
const cameraPage = ref(1);
const tilesStore = useTilesStore();

const isIframe = computed(() => window.self !== window.top);

const { fetchVisibleTiles } = tilesStore;
const alprs = computed(() => tilesStore.allNodes);
const visibleCameras = computed(() => bounds.value
  ? filterCamerasInBounds(alprs.value, bounds.value)
  : []);
const cameraPageCount = computed(() => Math.max(1, Math.ceil(visibleCameras.value.length / CAMERA_PAGE_SIZE)));
const paginatedCameras = computed(() => paginateCameras(visibleCameras.value, {
  page: cameraPage.value,
  pageSize: CAMERA_PAGE_SIZE,
}));

watch(visibleCameras, () => {
  cameraPage.value = 1;
});

watch(cameraPageCount, (pageCount) => {
  cameraPage.value = Math.min(cameraPage.value, pageCount);
});

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

function showCameraOnMap(id: string): void {
  if (leafletMap.value?.openCamera(id)) {
    cameraListOpen.value = false;
  }
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

.camera-list-panel {
  box-sizing: border-box;
  width: min(420px, calc(100vw - 24px));
  max-height: min(70vh, 640px);
  overflow-y: auto;
  padding: 16px;
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.camera-list-heading {
  margin: 0;
  font-size: 1.125rem;
  line-height: 1.4;
}

.camera-list-status,
.camera-list-empty {
  margin: 8px 0;
}

.camera-list {
  display: grid;
  gap: 10px;
  margin: 12px 0;
  padding: 0;
  list-style: none;
}

.camera-list-item {
  display: grid;
  gap: 8px;
  padding-block: 10px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.2);
}

.camera-list-item .v-btn {
  justify-self: start;
}

.camera-list-pagination {
  position: sticky;
  bottom: -16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin: 8px -8px -16px;
  padding: 8px 0;
  background: rgb(var(--v-theme-surface));
}

@media (max-width: 599px) {
  .camera-list-panel {
    max-height: 60vh;
    padding: 12px;
  }

  .camera-list-pagination {
    bottom: -12px;
    margin-bottom: -12px;
  }
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
