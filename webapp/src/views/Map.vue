<template>
  <NewVisitor />
  <div class="map-container" @keyup="handleKeyUp">
    <leaflet-map v-if="center" v-model:center="center" v-model:zoom="zoom" :current-location="currentLocation"
      @update:bounds="updateBounds" :alprs :geojson :route>
      <!-- SEARCH -->
      <template v-slot:topleft>
        <!-- Toggle Button -->
        <div class="mb-2">
          <v-btn-toggle v-model="isRouteMode" mandatory class="mb-2 search-toggle">
            <v-btn :value="false" size="small" variant="flat">
              <v-icon start>mdi-magnify</v-icon>
              Search
            </v-btn>
            <v-btn :value="true" size="small" variant="flat">
              <v-icon start>mdi-directions</v-icon>
              Route
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- Search Form -->
        <form v-if="!isRouteMode" @submit.prevent="onSearch">
          <v-text-field :rounded="xs || undefined" :density="xs ? 'compact' : 'default'" class="map-search"
            ref="searchField" prepend-inner-icon="mdi-magnify" placeholder="Search for a location" single-line
            variant="solo" clearable hide-details v-model="searchInput" type="search">
            <template v-slot:append-inner>
              <v-btn :disabled="!searchInput" variant="text" flat color="#0080BC" @click="onSearch">
                Go<v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </template>
          </v-text-field>
        </form>

        <!-- Route Form -->
        <form v-else @submit.prevent="onRouteSearch">
          <v-text-field :rounded="xs || undefined" :density="xs ? 'compact' : 'default'" class="map-search mb-2"
            ref="routeStartField" prepend-inner-icon="mdi-map-marker" placeholder="Origin" single-line variant="solo"
            clearable hide-details v-model="routeStartInput" type="search">
          </v-text-field>
          <v-text-field :rounded="xs || undefined" :density="xs ? 'compact' : 'default'" class="map-search"
            ref="routeEndField" prepend-inner-icon="mdi-map-marker-outline" placeholder="Destination" single-line
            variant="solo" clearable hide-details v-model="routeEndInput" type="search">
            <template v-slot:append-inner>
              <v-btn :disabled="!routeEndInput || !routeStartInput" variant="text" flat color="#0080BC"
                @click="onRouteSearch">
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
import { BoundingBox, routeQuery } from '@/services/apiService';
import { geocodeQuery } from '@/services/apiService';
import { useDisplay, useTheme } from 'vuetify';
import { useGlobalStore } from '@/stores/global';
import { useTilesStore } from '@/stores/tiles';
import L, { type LatLngTuple } from 'leaflet';
globalThis.L = L;
import 'leaflet/dist/leaflet.css'
import LeafletMap from '@/components/LeafletMap.vue';
import NewVisitor from '@/components/NewVisitor.vue';

const DEFAULT_ZOOM = 12;

const zoom: Ref<number> = ref(DEFAULT_ZOOM);
const center: Ref<any | null> = ref(null);
const bounds: Ref<BoundingBox | null> = ref(null);
const searchField: Ref<any | null> = ref(null);
const routeStartField: Ref<any | null> = ref(null);
const routeEndField: Ref<any | null> = ref(null);
const searchInput: Ref<string> = ref(''); // For the text input field
const routeStartInput: Ref<string> = ref(''); // For the route start input field
const routeEndInput: Ref<string> = ref(''); // For the route end input field
const searchQuery: Ref<string> = ref(''); // For URL and boundaries (persistent)
const geojson: Ref<GeoJSON.GeoJsonObject | null> = ref(null);
const route: Ref<GeoJSON.LineString | null> = ref(null);
const isRouteMode: Ref<boolean> = ref(false); // Toggle between search and route mode
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

function toggleSearchMode() {
  isRouteMode.value = !isRouteMode.value;
  // Clear inputs when switching modes
  if (isRouteMode.value) {
    searchInput.value = '';
  } else {
    routeStartInput.value = '';
    routeEndInput.value = '';
    route.value = null; // Clear route when switching back to search
  }
}

function setZoom(geoJson: GeoJSON.GeoJsonObject | null) {
  // If we have GeoJSON with bounds, zoom to fit the bounds
  if (geoJson) {
    geojson.value = geoJson;

    // Calculate bounds from GeoJSON to zoom to fit
    const geoJsonLayer = L.geoJSON(geoJson);
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
}

function onSearch() {
  searchField.value?.blur();
  if (!searchInput.value) {
    return;
  }
  geocodeQuery(searchInput.value, center.value)
    .then((result: any) => {
      if (!result) {
        alert('No results found');
        return;
      }
      const { lat, lon: lng } = result;
      center.value = { lat: parseFloat(lat), lng: parseFloat(lng) };
      setZoom(result.geojson || null);

      searchQuery.value = searchInput.value; // Store the successful search query
      updateURL();
      searchInput.value = ''; // Clear the input field
    });
}


function onRouteSearch() {
  routeStartField.value?.blur();
  routeEndField.value?.blur();
  if (!routeStartField.value || !routeEndField.value) {
    return;
  }
  geocodeQuery(routeStartInput.value, center.value)
    .then((result: any) => {
      if (!result) {
        alert('No results found for start location');
        return;
      }
      const { lat: latStart, lon: lngStart } = result;
      console.log("Got start location", result)
      geocodeQuery(routeEndInput.value, center.value)
        .then((result: any) => {
          if (!result) {
            alert('No results found for end location');
            return;
          }
          const { lat: latEnd, lon: lngEnd } = result;

          routeQuery({ lat: latStart, lng: lngStart }, { lat: latEnd, lng: lngEnd })
            .then((routeData) => {
              route.value = routeData.routes[0].geometry as GeoJSON.GeoJsonObject;
              center.value = {
                lat: (routeData.waypoints[0].location[1] + routeData.waypoints[1].location[1]) / 2,
                lng: (routeData.waypoints[0].location[0] + routeData.waypoints[1].location[0]) / 2,
              };
            })
            .catch((error) => {
              alert("Error fetching route data.");
              console.debug("Error fetching route data:", error);
            });

          searchQuery.value = routeStartInput.value + '>' + routeEndInput.value; // Store the successful search query
          updateURL(); // TODO have route generate from URL
        });
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

  const baseHash = `#map=${zoom.value}/${center.value.lat.toFixed(6)}/${center.value.lng.toFixed(6)}/route=${isRouteMode.value}`;
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
});

</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active in <2.1.8 */
  {
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

.search-toggle {
  /* background-color: rgb(255, 255, 255) !important; */
  /* backdrop-filter: blur(10px); */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: calc(100vw - 22px) !important;
}

/* TODO fix toggle dark mode */
@media (min-width: 600px) {
  .search-toggle {
    max-width: 320px !important;
  }
}

.search-toggle .v-btn {
  flex: 1 !important;
}
</style>
