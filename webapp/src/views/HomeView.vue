<template>
  <div class="map-container" @keyup="handleKeyUp">
    <NewVisitor />

    <v-card class="map-notif" v-show="isLoadingALPRs && !showClusters">
      <v-card-title><v-progress-circular indeterminate color="primary" /></v-card-title>
    </v-card>

    <!-- use-global-leaflet=false is a workaround for a bug in current version of vue-leaflet -->
    <l-map
      v-if="center"
      ref="map"
      v-model:zoom="zoom"
      v-model:center="center"
      :use-global-leaflet="false"
      @update:bounds="updateBounds"
      @ready="mapLoaded"
      :options="{ zoomControl: false, attributionControl: false }"
    >
      <l-control position="bottomleft">
        <ALPRCounter />
      </l-control>

      <l-control position="topleft">
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
      </l-control>
      <!-- url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" -->

      <l-tile-layer
        :url="mapTileUrl"
        layer-type="base"
        name="OpenStreetMap"
      />
      
      <l-control position="bottomright">
        <v-btn @click="goToUserLocation" icon class="mt-2">
          <v-icon x-large>mdi-crosshairs-gps</v-icon>
        </v-btn>
      </l-control>

      <DFMarkerCluster v-if="showClusters" v-for="cluster in clusters" :key="cluster.id" :lat="cluster.lat" :lon="cluster.lon" />
      <DFMapMarker v-else v-for="alpr in visibleALPRs" :key="alpr.id" :alpr :show-fov="zoom >= 16" />
    </l-map>
    <div class="loader" v-else>
      <span class="mb-4 text-grey">Loading Map</span>
      <v-progress-circular indeterminate color="primary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import 'leaflet/dist/leaflet.css';
import { LMap, LTileLayer, LControl } from '@vue-leaflet/vue-leaflet';
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router'
import type { Ref } from 'vue';
import { BoundingBox } from '@/services/apiService';
import type { Cluster } from '@/services/apiService';
import { getALPRs, geocodeQuery, getClusters } from '@/services/apiService';
import { useDisplay, useTheme } from 'vuetify';
import DFMapMarker from '@/components/DFMapMarker.vue';
import DFMarkerCluster from '@/components/DFMarkerCluster.vue';
import NewVisitor from '@/components/NewVisitor.vue';
import ALPRCounter from '@/components/ALPRCounter.vue';
import type { ALPR } from '@/types';

const DEFAULT_ZOOM = 12;
const MIN_ZOOM_FOR_REFRESH = 4;
const CLUSTER_ZOOM_THRESHOLD = 9;

const theme = useTheme();
const zoom: Ref<number> = ref(DEFAULT_ZOOM);
const center: Ref<any|null> = ref(null);
const bounds: Ref<BoundingBox|null> = ref(null);
const searchField: Ref<any|null> = ref(null);
const searchQuery: Ref<string> = ref('');
const router = useRouter();
const { xs } = useDisplay();

const canRefreshMarkers = computed(() => zoom.value >= MIN_ZOOM_FOR_REFRESH);
const mapTileUrl = computed(() =>
  theme.global.name.value === 'dark' ?
    'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' :
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
);

const alprs: Ref<ALPR[]> = ref([]);
const clusters: Ref<Cluster[]> = ref([]);
const bboxForLastRequest: Ref<BoundingBox|null> = ref(null);
const showClusters = computed(() => zoom.value <= CLUSTER_ZOOM_THRESHOLD);
const isLoadingALPRs = ref(false);

const visibleALPRs = computed(() => {
  return alprs.value.filter(alpr => bounds.value?.containsPoint(alpr.lat, alpr.lon));
});

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
      searchQuery.value = '';
    });
}

function goToUserLocation() {
  getUserLocation()
    .then(location => {
      center.value = { lat: location[0], lng: location[1] };
      zoom.value = DEFAULT_ZOOM;
    }).catch(error => {
      console.debug('Error getting user location.', error);
    });
}

function getUserLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          reject(error);
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        }
      );
    } else {
      reject(new Error('Geolocation is not supported by this browser.'));
    }
  });
};

function mapLoaded(map: any) {
  updateBounds(map.getBounds());
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

  if (bboxForLastRequest.value && newBoundingBox.isSubsetOf(bboxForLastRequest.value)) {
    console.debug('new bounds are a subset of the last request, skipping');
    return;
  }

  updateMarkers();
}

function updateURL() {
  if (!center.value) {
    return;
  }

  router.replace({
    hash: `#map=${zoom.value}/${center.value.lat.toFixed(6)}/${center.value.lng.toFixed(6)}`
  });
}

watch(zoom, (newZoom, oldZoom) => {

  if (newZoom <= CLUSTER_ZOOM_THRESHOLD && oldZoom > CLUSTER_ZOOM_THRESHOLD) {
    bboxForLastRequest.value = bounds.value; 
  } else if (newZoom < CLUSTER_ZOOM_THRESHOLD) {
    alprs.value = [];
    bboxForLastRequest.value = null;
  }
});

function updateMarkers() {
  // Fetch ALPRs in the current view
  if (!bounds.value) {
    return;
  }

  if (showClusters.value || !canRefreshMarkers.value) {
    return;
  }

  isLoadingALPRs.value = true;
  getALPRs(bounds.value)
    .then((result: any) => {
      // merge incoming with existing, so that moving the map doesn't remove markers
      const existingIds = new Set(alprs.value.map(alpr => alpr.id));
      const newAlprs = result.elements.filter((alpr: any) => !existingIds.has(alpr.id));
      alprs.value = [...alprs.value, ...newAlprs];
      bboxForLastRequest.value = bounds.value;
    })
    .finally(() => {
      isLoadingALPRs.value = false;
    });
}

onMounted(() => {
  getClusters()
    .then((result: any) => {
      clusters.value = result.clusters;
    });

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
    zoom.value = 4;
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
  height: calc(100dvh - 64px);
  overflow: auto;
}

.map-search {
  width: calc(100vw - 22px);
  max-width: 400px;
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
