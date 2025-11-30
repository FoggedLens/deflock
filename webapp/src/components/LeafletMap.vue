<template>
  <div id="map" :style="{
    height: isFullScreen ? '100dvh' : 'calc(100dvh - 64px)',
    marginTop: isFullScreen ? '0' : '64px',
  }">
    <div class="topleft">
      <slot name="topleft"></slot>
    </div>

    <div class="topright">
      <!-- Controls -->
      <div v-if="!isFullScreen" class="d-flex flex-column ga-2">
        <!-- Clustering Toggle Switch -->
        <v-card variant="elevated">
          <v-card-text class="py-0">
            <div class="d-flex align-center justify-space-between">
              <v-icon size="small" class="mr-2">mdi-chart-bubble</v-icon>
              <span class="text-caption mr-2">Grouping</span>
              <v-switch
                v-model="clusteringEnabled"
                :disabled="currentZoom < 12"
                hide-details
                density="compact"
                color="primary"
                class="mx-1"
              />
            </div>
          </v-card-text>
        </v-card>
        
        <!-- City Boundaries Toggle Switch -->
        <v-card v-if="geojson" variant="elevated">
          <v-card-text class="py-0">
            <div class="d-flex align-center justify-space-between">
              <v-icon size="small" class="mr-2">mdi-map-outline</v-icon>
              <span class="text-caption mr-2">City Boundaries</span>
              <v-switch
                v-model="cityBoundariesVisible"
                hide-details
                density="compact"
                color="primary"
                class="mx-1"
              />
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <div class="bottomright">
      <slot name="bottomright"></slot>
    </div>
    
    <!-- Status Bar for Zoom Warning -->
    <v-slide-y-transition>
      <div 
        v-if="showAutoDisabledStatus" 
        class="clustering-status-bar"
      >
        <v-icon size="small" class="mr-2">mdi-information</v-icon>
        <span class="text-caption">
          Camera grouping is on for performance at this zoom level.
        </span>
        <v-btn 
          size="x-small" 
          icon
          variant="text" 
          color="white"
          class="ml-2"
          @click="dismissZoomWarning"
        >
          <v-icon size="small">mdi-close</v-icon>
        </v-btn>
      </div>
    </v-slide-y-transition>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, h, createApp, watch, ref, type PropType, type Ref } from 'vue';
import L, { type LatLngTuple, type FeatureGroup, type MarkerClusterGroup, type Marker, type CircleMarker } from 'leaflet';
import type { ALPR } from '@/types';
import DFMapPopup from './DFMapPopup.vue';
import { createVuetify } from 'vuetify'
import { useRoute } from 'vue-router';
import { computed } from 'vue';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import { useTheme } from 'vuetify';

const MARKER_COLOR = 'rgb(63,84,243)';
const CLUSTER_DISABLE_ZOOM = 16; // Clustering disabled at zoom 16 and above

// Internal State Management
const markerMap = new Map<string, Marker | CircleMarker>();
const isInternalUpdate = ref(false);
const route = useRoute();
const isFullScreen = computed(() => route.query.fullscreen === 'true');

// Clustering Control
const clusteringEnabled = ref(true);
const currentZoom = ref(0);
const zoomWarningDismissed = ref(false);

// City Boundaries Control
const cityBoundariesVisible = ref(true);

// Computed property to determine if clustering should be active based on zoom and user preference
const shouldCluster = computed(() => {
  // Force clustering ON when zoomed out (below zoom 12) regardless of user preference
  if (currentZoom.value < 12) {
    return true;
  }
  // At higher zoom levels, respect user preference
  return clusteringEnabled.value && currentZoom.value < CLUSTER_DISABLE_ZOOM;
});

// Show status when clustering is disabled by user but forced ON due to zoom
const showAutoDisabledStatus = computed(() => {
  return !clusteringEnabled.value && currentZoom.value < 12 && !zoomWarningDismissed.value;
});

const props = defineProps({
  center: {
    type: Object as PropType<LatLngTuple>,
    required: true,
  },
  zoom: {
    type: Number,
    required: true,
  },
  alprs: {
    type: Array as PropType<ALPR[]>,
    default: () => [],
  },
  geojson: {
    type : Object as PropType<GeoJSON.GeoJsonObject | null>,
    default: null,
  },
  currentLocation: {
    type: Object as PropType<[number, number] | null>,
    default: null,
  },
});

const emit = defineEmits(['update:center', 'update:zoom', 'update:bounds']);

// Map instance and layers
let map: L.Map;
let circlesLayer: FeatureGroup;
let clusterLayer: MarkerClusterGroup;
let currentLocationLayer: FeatureGroup;

// Marker Creation Utilities
function createSVGMarkers(alpr: ALPR): string {
  const orientationValues = (alpr.tags['camera:direction'] || alpr.tags.direction || '')
    .split(';')
    .map(val => /^\d+$/.test(val) ? parseInt(val) : cardinalToDegrees(val.trim()));

  const fovPath = `
      <path class="someSVGpath" d="M215.248,221.461L99.696,43.732C144.935,16.031 198.536,0 256,0C313.464,0 367.065,16.031 412.304,43.732L296.752,221.461C287.138,209.593 272.448,202.001 256,202.001C239.552,202.001 224.862,209.593 215.248,221.461Z" style="fill:rgb(87,87,87);fill-opacity:0.46;"/>
      <path class="someSVGpath" d="M215.248,221.461L99.696,43.732C144.935,16.031 198.536,0 256,0C313.464,0 367.065,16.031 412.304,43.732L296.752,221.461C287.138,209.593 272.448,202.001 256,202.001C239.552,202.001 224.862,209.593 215.248,221.461ZM217.92,200.242C228.694,192.652 241.831,188.195 256,188.195C270.169,188.195 283.306,192.652 294.08,200.242C294.08,200.242 392.803,48.4 392.803,48.4C352.363,26.364 305.694,13.806 256,13.806C206.306,13.806 159.637,26.364 119.197,48.4L217.92,200.242Z" style="fill:rgb(137,135,135);"/>
    `;
  const allDirectionsPath = orientationValues.map(degrees => `
        <g style="transform:rotate(${degrees}deg); transform-origin: center;">
          ${fovPath}
        </g>
      `).join('');

  return `<svg class="svgMarker" width="100%" height="100%" viewBox="0 0 512 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
      ${allDirectionsPath}
        <g transform="matrix(0.906623,0,0,0.906623,23.9045,22.3271)">
          <circle class="someSVGpath" cx="256" cy="256" r="57.821" style="fill:${MARKER_COLOR};fill-opacity:0.41;"/>
          <path class="someSVGpath" d="M256,174.25C301.119,174.25 337.75,210.881 337.75,256C337.75,301.119 301.119,337.75 256,337.75C210.881,337.75 174.25,301.119 174.25,256C174.25,210.881 210.881,174.25 256,174.25ZM256,198.179C224.088,198.179 198.179,224.088 198.179,256C198.179,287.912 224.088,313.821 256,313.821C287.912,313.821 313.821,287.912 313.821,256C313.821,224.088 287.912,198.179 256,198.179Z" style="fill:${MARKER_COLOR};"/>
        </g>
    </svg>
    `;
}

function cardinalToDegrees(cardinal: string): number {
  const cardinalMap: Record<string, number> = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135.5,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5
  };
  return cardinalMap[cardinal] ?? cardinal;
}

function createMarker(alpr: ALPR): Marker | CircleMarker {
  if (hasPlottableOrientation(alpr.tags.direction || alpr.tags['camera:direction'])) {
    const icon = L.divIcon({
      className: 'leaflet-data-marker',
      html: createSVGMarkers(alpr),
      iconSize: [60, 60],
      iconAnchor: [30, 30],
      popupAnchor: [0, 0],
    });
    return L.marker([alpr.lat, alpr.lon], { icon });
  }

  return L.circleMarker([alpr.lat, alpr.lon], {
    fill: true,
    fillColor: MARKER_COLOR,
    fillOpacity: 0.6,
    stroke: true,
    color: MARKER_COLOR,
    opacity: 1,
    radius: 8,
    weight: 3,
  });
}

const theme = useTheme();

function bindPopup(marker: L.CircleMarker | L.Marker, alpr: ALPR): L.CircleMarker | L.Marker {
  marker.bindPopup('');

  marker.on('popupopen', (e: any) => {
    const popupContent = document.createElement('div');
    createApp({
      render() {
        return h(DFMapPopup, {
          alpr: {
            id: alpr.id,
            lat: alpr.lat,
            lon: alpr.lon,
            tags: alpr.tags,
            type: alpr.type,
          }
        });
      }
    }).use(createVuetify({
      theme: {
        defaultTheme: theme.global.name.value,
      },
    })).mount(popupContent);

    e.popup.setContent(popupContent);
  });

  return marker;
}

function hasPlottableOrientation(orientationDegrees: string) {
  // OSM tags are strings, and some have multiple values (e.g. '0;90')
  return orientationDegrees && !isNaN(parseInt(orientationDegrees));
}

// Map State Management
function initializeMap() {
  map = L.map('map', {
    zoomControl: false,
    maxZoom: 18, // max for OSM tiles
    minZoom: 3,  // don't overload the browser
  }).setView(props.center, props.zoom);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  clusterLayer = L.markerClusterGroup({
    chunkedLoading: true,
    disableClusteringAtZoom: shouldCluster.value ? CLUSTER_DISABLE_ZOOM : 1,
    removeOutsideVisibleBounds: true,
    maxClusterRadius: 60,
    spiderfyOnEveryZoom: false,
    spiderfyOnMaxZoom: false,
  });

  circlesLayer = L.featureGroup();
  currentLocationLayer = L.featureGroup();

  // Initialize current zoom
  currentZoom.value = props.zoom;

  map.addLayer(clusterLayer);
  registerMapEvents();

  if (props.geojson) {
    updateGeoJson(props.geojson);
  }

  if (props.alprs.length) {
    updateMarkers(props.alprs);
  } else {
    emit('update:bounds', map.getBounds());
  }

  if (props.currentLocation) {
    updateCurrentLocation();
  }
}

function updateMarkers(newAlprs: ALPR[]): void {
  const currentIds = new Set(markerMap.keys());
  const nonexistingAlprs = newAlprs.filter(alpr => !currentIds.has(alpr.id));

  // Add markers
  for (const alpr of nonexistingAlprs) {
    if (!currentIds.has(alpr.id)) {
      // Add new marker
      const marker = createMarker(alpr);
      bindPopup(marker, alpr);
      markerMap.set(alpr.id, marker);
      circlesLayer.addLayer(marker);
    }
  }

  // Update cluster layer
  clusterLayer.clearLayers();
  clusterLayer.addLayer(circlesLayer);
}

function updateGeoJson(newGeoJson: GeoJSON.GeoJsonObject | null): void {
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });

  if (newGeoJson && cityBoundariesVisible.value) {
    const geoJsonLayer = L.geoJSON(newGeoJson, {
      style: {
        color: '#3388ff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.2,
      },
      interactive: false, // Make unclickable
    });
    geoJsonLayer.addTo(map);
  }
}

function updateCurrentLocation(): void {
  currentLocationLayer.clearLayers();

  if (props.currentLocation) {
    const marker = L.circleMarker([props.currentLocation[0], props.currentLocation[1]], {
      radius: 10,
      color: '#ffffff',
      fillColor: '#007bff',
      fillOpacity: 1,
      weight: 4
    }).bindPopup('Current Location');

    currentLocationLayer.addLayer(marker);
    map.addLayer(currentLocationLayer);
  }
}

function updateClusteringBehavior(): void {
  if (!clusterLayer || !map) return;
  // Use shouldCluster computed value which handles both zoom and user preference
  const newDisableZoom = shouldCluster.value ? CLUSTER_DISABLE_ZOOM : 1;
  
  // Remove the cluster layer, update its options, and re-add it
  if (map.hasLayer(clusterLayer)) {
    map.removeLayer(clusterLayer);
  }
  
  // Create new cluster layer with updated settings
  const newClusterLayer = L.markerClusterGroup({
    chunkedLoading: true,
    disableClusteringAtZoom: newDisableZoom,
    removeOutsideVisibleBounds: true,
    maxClusterRadius: 60,
    spiderfyOnEveryZoom: false,
    spiderfyOnMaxZoom: false,
  });
  
  // Transfer all markers to the new cluster layer
  newClusterLayer.addLayer(circlesLayer);
  
  // Replace the old cluster layer
  clusterLayer = newClusterLayer;
  map.addLayer(clusterLayer);
}

function dismissZoomWarning(): void {
  zoomWarningDismissed.value = true;
}

// Lifecycle Hooks
onMounted(() => {
  initializeMap();

  // Watch for clustering toggle
  watch(clusteringEnabled, () => {
    updateClusteringBehavior();
  });
  
  // Watch for zoom-based clustering changes
  watch(shouldCluster, () => {
    updateClusteringBehavior();
  });

  // Watch for prop changes
  watch(() => props.center, (newCenter: any) => {
    if (!isInternalUpdate.value) {
      isInternalUpdate.value = true;
      map.setView(newCenter, map.getZoom(), { animate: false });
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    }
  });

  watch(() => props.zoom, (newZoom: number) => {
    if (!isInternalUpdate.value) {
      isInternalUpdate.value = true;
      currentZoom.value = newZoom;
      map.setZoom(newZoom);
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    }
  });

  watch(() => props.alprs, (newAlprs) => {
    updateMarkers(newAlprs);
  }, { deep: true });

  watch(() => props.geojson, (newGeoJson) => {
    updateGeoJson(newGeoJson);
  }, { deep: true });

  // Watch for city boundaries visibility changes
  watch(() => cityBoundariesVisible.value, () => {
    updateGeoJson(props.geojson);
  });

  watch(() => props.currentLocation, () => {
    updateCurrentLocation();
  });
});

onBeforeUnmount(() => {
  map?.remove();
});

function registerMapEvents() {
  map.on('moveend', () => {
    if (!isInternalUpdate.value) {
      emit('update:center', map.getCenter());
      emit('update:zoom', map.getZoom());
      emit('update:bounds', map.getBounds());
    }
  });
  
  map.on('zoomend', () => {
    if (!isInternalUpdate.value) {
      const oldZoom = currentZoom.value;
      const newZoom = map.getZoom();
      currentZoom.value = newZoom;
      
      // Reset zoom warning when user zooms in enough
      if (newZoom >= 12) {
        zoomWarningDismissed.value = false;
      }
    }
  });
}
</script>

<style scoped>
@import 'leaflet/dist/leaflet.css';
@import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
@import 'leaflet.markercluster/dist/MarkerCluster.css';

#map {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.topleft {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 1000;
}

.topright {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 1000;
}

.bottomright {
  position: absolute;
  bottom: 50px; /* hack */
  right: 60px; /* hack */
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.clustering-status-bar {
  position: fixed;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(33, 33, 33, 0.9);
  color: white;
  padding: 12px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 280px;
  max-width: 90vw;
  text-align: center;
}

/* Mobile-specific improvements */
@media (max-width: 768px) {
  .clustering-status-bar {
    margin: 0 10px;
    min-width: unset;
    max-width: calc(100vw - 20px);
  }

  .topright {
    top: 60px;
  }
}
</style>

<style> /* (Global) */
/* Disables clicks on the main wrappers */
.leaflet-marker-icon.leaflet-interactive:not(.marker-cluster), .svgMarker {
  pointer-events: none;
  cursor: default;
}
.svgMarker {
  pointer-events: none;
  cursor: default;
}

/* Enables clicks only on actual SVG path */
.someSVGpath {
  pointer-events: all;
  cursor: pointer;
}
</style>
