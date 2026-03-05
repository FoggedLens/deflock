<template>
  <div ref="containerRef" class="map-container" :style="{
    height: isIframe ? '100dvh' : 'calc(100dvh - var(--v-layout-top, 64px))',
  }">
    <!-- Loading progress bar -->
    <v-progress-linear
      v-if="loading"
      :model-value="progress"
      color="rgb(63,84,243)"
      height="4"
      style="position: absolute; top: 0; z-index: 1001;"
    />

    <div ref="mapRef" class="map-element" />

    <div class="topleft">
      <slot name="topleft" />
    </div>

    <div class="topright">
      <div v-if="!isIframe" class="d-flex flex-column ga-2">
        <!-- Mobile layer toggle button -->
        <v-btn
          class="layer-toggle-btn"
          icon
          size="small"
          variant="elevated"
          @click="layerMenuOpen = !layerMenuOpen"
        >
          <v-icon>mdi-layers</v-icon>
        </v-btn>

        <!-- Toggle cards (always visible on desktop, expandable on mobile) -->
        <v-expand-transition>
          <div v-show="layerMenuOpen" class="layer-toggles">
            <!-- Clustering Toggle Switch -->
            <v-card variant="elevated">
              <v-card-text class="py-0">
                <div class="d-flex align-center justify-space-between">
                  <span>
                    <v-icon size="small" class="mr-2">mdi-chart-bubble</v-icon>
                    <span class="text-caption mr-2">Grouping</span>
                  </span>
                  <v-switch
                    v-model="clusteringEnabled"
                    hide-details
                    density="compact"
                    color="primary"
                    class="mx-1"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- Heatmap Toggle Switch -->
            <v-card variant="elevated">
              <v-card-text class="py-0">
                <div class="d-flex align-center justify-space-between">
                  <span>
                    <v-icon size="small" class="mr-2">mdi-fire</v-icon>
                    <span class="text-caption mr-2">Heatmap</span>
                  </span>
                  <v-switch
                    v-model="heatmapEnabled"
                    hide-details
                    density="compact"
                    color="primary"
                    class="mx-1"
                  />
                </div>
              </v-card-text>
            </v-card>

            <!-- City Boundaries Toggle Switch -->
            <v-card v-if="searchGeojson" variant="elevated">
              <v-card-text class="py-0">
                <div class="d-flex align-center justify-space-between">
                  <span>
                    <v-icon size="small" class="mr-2">mdi-map-outline</v-icon>
                    <span class="text-caption mr-2">City Boundaries</span>
                  </span>
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
        </v-expand-transition>
      </div>
    </div>

    <div v-if="isIframe" class="bottomleft">
      <img src="/deflock-logo-grey.svg" alt="Deflock Logo" style="height: 24px; opacity: 0.75;" />
    </div>

    <div class="bottomright">
      <slot name="bottomright" />
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
import {
  ref, computed, watch, onMounted, onUnmounted, h, createApp,
  type PropType,
} from 'vue';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import DFMapPopup from './DFMapPopup.vue';
import { createVuetify } from 'vuetify';
import { useTheme } from 'vuetify';
import { buildDirectionCones } from '@/utils/directionCones';

// ---------------------------------------------------------------------------
// Props & Emits
// ---------------------------------------------------------------------------

const props = defineProps({
  center: {
    type: Object as PropType<{ lat: number; lng: number }>,
    required: true,
  },
  zoom: {
    type: Number,
    required: true,
  },
  geojsonData: {
    type: Object as PropType<GeoJSON.FeatureCollection | null>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  searchGeojson: {
    type: Object as PropType<GeoJSON.GeoJsonObject | null>,
    default: null,
  },
  currentLocation: {
    type: Object as PropType<[number, number] | null>,
    default: null,
  },
});

const emit = defineEmits<{
  (e: 'update:center', value: { lat: number; lng: number }): void;
  (e: 'update:zoom', value: number): void;
}>();

// ---------------------------------------------------------------------------
// Refs & State
// ---------------------------------------------------------------------------

const containerRef = ref<HTMLElement | null>(null);
const mapRef = ref<HTMLElement | null>(null);
let map: maplibregl.Map | null = null;
let locationMarker: maplibregl.Marker | null = null;

const isIframe = computed(() => window.self !== window.top);
const isInternalUpdate = ref(false);

// Clustering control
const clusteringEnabled = ref(true);
const currentZoom = ref(0);
const zoomWarningDismissed = ref(false);

// Heatmap control
const heatmapEnabled = ref(false);

// City boundaries control
const cityBoundariesVisible = ref(true);

// Mobile layer menu control
const layerMenuOpen = ref(false);

const theme = useTheme();

// Whether data layers have been added to the map
let layersAdded = false;

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

const shouldCluster = computed(() => {
  return clusteringEnabled.value;
});

const showAutoDisabledStatus = computed(() => {
  return false;
});

// ---------------------------------------------------------------------------
// Empty FeatureCollection constant
// ---------------------------------------------------------------------------

const EMPTY_FC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// ---------------------------------------------------------------------------
// Map style (OSM raster tiles)
// ---------------------------------------------------------------------------

const mapStyle: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

// ---------------------------------------------------------------------------
// Layer helpers
// ---------------------------------------------------------------------------

function addAlprLayers() {
  if (!map) return;

  // Cluster circles
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'alprs',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': [
        'step', ['get', 'point_count'],
        'rgb(63,84,243)', 5,
        'rgb(55,73,210)', 20,
        'rgb(45,60,180)', 50,
        'rgb(35,48,150)',
      ],
      'circle-radius': [
        'step', ['get', 'point_count'],
        14, 5, 16, 20, 20, 50, 26,
      ],
      'circle-stroke-width': 2,
      'circle-stroke-color': 'rgba(63,84,243,0.5)',
      'circle-stroke-opacity': 0.5,
    },
  });

  // Cluster count labels
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'alprs',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-size': 13,
    },
    paint: {
      'text-color': '#ffffff',
    },
  });

  // Unclustered camera points
  map.addLayer({
    id: 'unclustered-point',
    type: 'circle',
    source: 'alprs',
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': 'rgb(63,84,243)',
      'circle-radius': 6,
      'circle-stroke-width': 2,
      'circle-stroke-color': 'rgba(63,84,243,0.5)',
      'circle-opacity': 1,
    },
  });
}

function addDirectionConeLayers() {
  if (!map) return;

  // Fill layer
  map.addLayer({
    id: 'direction-cones',
    type: 'fill',
    source: 'direction-cones',
    minzoom: 12,
    paint: {
      'fill-color': 'rgb(63,84,243)',
      'fill-opacity': 0.35,
    },
  });

  // Outline layer
  map.addLayer({
    id: 'direction-cones-outline',
    type: 'line',
    source: 'direction-cones',
    minzoom: 12,
    paint: {
      'line-color': 'rgb(50,67,194)',
      'line-width': 2,
      'line-opacity': 0.7,
    },
  });
}

function addHeatmapLayer() {
  if (!map) return;

  map.addSource('heatmap', {
    type: 'geojson',
    data: props.geojsonData ?? EMPTY_FC,
  });

  map.addLayer({
    id: 'heatmap-layer',
    type: 'heatmap',
    source: 'heatmap',
    maxzoom: 15,
    layout: {
      visibility: heatmapEnabled.value ? 'visible' : 'none',
    },
    paint: {
      'heatmap-weight': 1,
      'heatmap-intensity': [
        'interpolate', ['linear'], ['zoom'],
        0, 0.15,
        4, 0.4,
        7, 0.8,
        9, 1,
        12, 2,
        15, 3,
      ],
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(0,0,0,0)',
        0.1, 'rgb(63,84,243)',
        0.3, 'rgb(100,130,255)',
        0.5, 'rgb(180,120,255)',
        0.7, 'rgb(255,100,150)',
        0.9, 'rgb(255,160,60)',
        1, 'rgb(255,240,80)',
      ],
      'heatmap-radius': [
        'interpolate', ['linear'], ['zoom'],
        0, 2,
        4, 4,
        7, 10,
        9, 22,
        12, 30,
        15, 40,
      ],
      'heatmap-opacity': [
        'interpolate', ['linear'], ['zoom'],
        0, 0.85,
        9, 0.85,
        12, 0.6,
        14, 0.3,
        15, 0,
      ],
    },
  });
}

function removeHeatmapLayer() {
  if (!map) return;
  if (map.getLayer('heatmap-layer')) map.removeLayer('heatmap-layer');
  if (map.getSource('heatmap')) map.removeSource('heatmap');
}

function setMarkerLayersVisibility(visible: boolean) {
  if (!map) return;
  const v = visible ? 'visible' : 'none';
  for (const id of ['clusters', 'cluster-count', 'unclustered-point', 'direction-cones', 'direction-cones-outline']) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, 'visibility', v);
    }
  }
}

function addDataSourcesAndLayers(data: GeoJSON.FeatureCollection, cluster: boolean) {
  if (!map) return;

  // ALPR source with clustering
  map.addSource('alprs', {
    type: 'geojson',
    data,
    cluster,
    clusterMaxZoom: 11,
    clusterRadius: 35,
  });

  addAlprLayers();

  // Direction cones source and layers
  const cones = buildDirectionCones(data);
  map.addSource('direction-cones', {
    type: 'geojson',
    data: cones,
  });

  addDirectionConeLayers();

  // Heatmap layer
  addHeatmapLayer();

  // Apply initial visibility based on heatmap state
  if (heatmapEnabled.value) {
    setMarkerLayersVisibility(false);
  }

  layersAdded = true;
}

function removeDataSourcesAndLayers() {
  if (!map) return;

  // Remove heatmap
  removeHeatmapLayer();
  // Remove ALPR layers
  for (const id of ['unclustered-point', 'cluster-count', 'clusters']) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  // Remove direction cone layers
  for (const id of ['direction-cones-outline', 'direction-cones']) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  // Remove sources
  if (map.getSource('alprs')) map.removeSource('alprs');
  if (map.getSource('direction-cones')) map.removeSource('direction-cones');

  layersAdded = false;
}

// ---------------------------------------------------------------------------
// Clustering toggle
// ---------------------------------------------------------------------------

function toggleClustering(enabled: boolean) {
  if (!map || !layersAdded) return;

  const src = map.getSource('alprs') as maplibregl.GeoJSONSource | undefined;
  if (!src) return;

  // Get current data from props (the source data)
  const currentData = props.geojsonData ?? EMPTY_FC;

  // Remove all ALPR layers and source
  for (const id of ['unclustered-point', 'cluster-count', 'clusters']) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource('alprs')) map.removeSource('alprs');

  // Re-add with updated cluster setting
  map.addSource('alprs', {
    type: 'geojson',
    data: currentData,
    cluster: enabled,
    clusterMaxZoom: 11,
    clusterRadius: 35,
  });

  addAlprLayers();

  // Keep markers hidden if heatmap is active
  if (heatmapEnabled.value) {
    setMarkerLayersVisibility(false);
  }
}

// ---------------------------------------------------------------------------
// Search boundary layers
// ---------------------------------------------------------------------------

function updateSearchBoundary(geojson: GeoJSON.GeoJsonObject | null) {
  if (!map) return;

  // Remove existing search boundary layers and source
  if (map.getLayer('search-boundary-fill')) map.removeLayer('search-boundary-fill');
  if (map.getLayer('search-boundary-line')) map.removeLayer('search-boundary-line');
  if (map.getSource('search-boundary')) map.removeSource('search-boundary');

  if (geojson && cityBoundariesVisible.value) {
    map.addSource('search-boundary', {
      type: 'geojson',
      data: geojson,
    });

    map.addLayer({
      id: 'search-boundary-fill',
      type: 'fill',
      source: 'search-boundary',
      paint: {
        'fill-color': '#3388ff',
        'fill-opacity': 0.2,
      },
    });

    map.addLayer({
      id: 'search-boundary-line',
      type: 'line',
      source: 'search-boundary',
      paint: {
        'line-color': '#3388ff',
        'line-width': 2,
        'line-opacity': 1,
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Current location marker
// ---------------------------------------------------------------------------

function updateLocationMarker() {
  if (locationMarker) {
    locationMarker.remove();
    locationMarker = null;
  }

  if (!map || !props.currentLocation) return;

  const el = document.createElement('div');
  el.style.width = '20px';
  el.style.height = '20px';
  el.style.borderRadius = '50%';
  el.style.backgroundColor = '#007bff';
  el.style.border = '4px solid #ffffff';
  el.style.boxShadow = '0 0 6px rgba(0,0,0,0.3)';

  locationMarker = new maplibregl.Marker({ element: el })
    .setLngLat([props.currentLocation[1], props.currentLocation[0]])
    .addTo(map);
}

// ---------------------------------------------------------------------------
// Popup handling
// ---------------------------------------------------------------------------

function setupPopupHandler() {
  if (!map) return;

  map.on('click', 'unclustered-point', (e) => {
    if (!map || !e.features || e.features.length === 0) return;

    const feature = e.features[0];
    const featureProps = feature.properties;
    const coords = (feature.geometry as GeoJSON.Point).coordinates.slice() as [number, number];

    // Handle antimeridian wrapping
    while (Math.abs(e.lngLat.lng - coords[0]) > 180) {
      coords[0] += e.lngLat.lng > coords[0] ? 360 : -360;
    }

    const popupEl = document.createElement('div');
    createApp({
      render() {
        return h(DFMapPopup, {
          alpr: {
            id: String(featureProps?.id),
            lat: coords[1],
            lon: coords[0],
            tags: typeof featureProps === 'string' ? JSON.parse(featureProps) : (featureProps ?? {}),
            type: 'node',
          },
        });
      },
    })
      .use(
        createVuetify({
          theme: {
            defaultTheme: 'dark',
          },
        }),
      )
      .mount(popupEl);

    new maplibregl.Popup({ className: 'df-popup' })
      .setLngLat(coords)
      .setDOMContent(popupEl)
      .addTo(map!);
  });
}

// ---------------------------------------------------------------------------
// Cluster click → zoom
// ---------------------------------------------------------------------------

function setupClusterClickHandler() {
  if (!map) return;

  map.on('click', 'clusters', (e) => {
    if (!map) return;
    const features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
    if (features.length === 0) return;

    const clusterId = features[0].properties?.cluster_id;
    const source = map.getSource('alprs') as maplibregl.GeoJSONSource;

    source.getClusterExpansionZoom(clusterId).then((zoom) => {
      if (!map) return;
      map.easeTo({
        center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
        zoom,
      });
    });
  });
}

// ---------------------------------------------------------------------------
// Cursor changes
// ---------------------------------------------------------------------------

function setupCursorHandlers() {
  if (!map) return;

  for (const layerId of ['clusters', 'unclustered-point']) {
    map.on('mouseenter', layerId, () => {
      if (map) map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', layerId, () => {
      if (map) map.getCanvas().style.cursor = '';
    });
  }
}

// ---------------------------------------------------------------------------
// Zoom warning dismiss
// ---------------------------------------------------------------------------

function dismissZoomWarning() {
  zoomWarningDismissed.value = true;
}

// ---------------------------------------------------------------------------
// fitGeoJSON (exposed)
// ---------------------------------------------------------------------------

function fitGeoJSON(geojson: GeoJSON.GeoJsonObject) {
  if (!map) return;

  const bounds = new maplibregl.LngLatBounds();
  let hasCoords = false;

  function processCoords(coords: any) {
    if (typeof coords[0] === 'number' && typeof coords[1] === 'number') {
      bounds.extend(coords as [number, number]);
      hasCoords = true;
    } else if (Array.isArray(coords)) {
      for (const c of coords) {
        processCoords(c);
      }
    }
  }

  function processGeometry(geometry: any) {
    if (!geometry) return;
    if (geometry.type === 'GeometryCollection') {
      for (const g of geometry.geometries) processGeometry(g);
    } else if (geometry.coordinates) {
      processCoords(geometry.coordinates);
    }
  }

  if ('features' in geojson) {
    for (const feature of (geojson as GeoJSON.FeatureCollection).features) {
      processGeometry(feature.geometry);
    }
  } else if ('geometry' in geojson) {
    processGeometry((geojson as GeoJSON.Feature).geometry);
  } else if ('coordinates' in geojson) {
    processGeometry(geojson);
  }

  if (hasCoords) {
    map.fitBounds(bounds, { padding: 50 });
  }
}

defineExpose({ fitGeoJSON });

// ---------------------------------------------------------------------------
// Map initialization
// ---------------------------------------------------------------------------

onMounted(() => {
  if (!mapRef.value) return;

  map = new maplibregl.Map({
    container: mapRef.value,
    style: mapStyle,
    center: [props.center.lng, props.center.lat],
    zoom: props.zoom,
    minZoom: 3,
    maxZoom: 18,
  });

  // Hide default navigation control (none added)

  currentZoom.value = props.zoom;

  map.on('load', () => {
    if (!map) return;

    // Add initial data if available
    if (props.geojsonData) {
      addDataSourcesAndLayers(props.geojsonData, shouldCluster.value);
    }

    // Add search boundary if available
    if (props.searchGeojson) {
      updateSearchBoundary(props.searchGeojson);
    }

    // Add current location marker
    updateLocationMarker();

    // Set up interaction handlers
    setupPopupHandler();
    setupClusterClickHandler();
    setupCursorHandlers();
  });

  // Map move/zoom events
  map.on('moveend', () => {
    if (!map || isInternalUpdate.value) return;
    const center = map.getCenter();
    emit('update:center', { lat: center.lat, lng: center.lng });
    emit('update:zoom', map.getZoom());
  });

  map.on('zoomend', () => {
    if (!map || isInternalUpdate.value) return;
    const newZoom = map.getZoom();
    currentZoom.value = newZoom;

    // Reset zoom warning when user zooms in enough
    if (newZoom >= 12) {
      zoomWarningDismissed.value = false;
    }
  });

  // ---------------------------------------------------------------------------
  // Watchers
  // ---------------------------------------------------------------------------

  // Watch geojsonData — add/update source and layers
  watch(
    () => props.geojsonData,
    (newData) => {
      if (!map || !map.isStyleLoaded()) return;

      if (newData) {
        if (layersAdded) {
          // Update existing source data
          const alprSource = map.getSource('alprs') as maplibregl.GeoJSONSource | undefined;
          if (alprSource) {
            alprSource.setData(newData);
          }
          // Update direction cones
          const conesSource = map.getSource('direction-cones') as maplibregl.GeoJSONSource | undefined;
          if (conesSource) {
            conesSource.setData(buildDirectionCones(newData));
          }
          // Update heatmap
          const heatmapSource = map.getSource('heatmap') as maplibregl.GeoJSONSource | undefined;
          if (heatmapSource) {
            heatmapSource.setData(newData);
          }
        } else {
          addDataSourcesAndLayers(newData, shouldCluster.value);
          // Re-setup interaction handlers now that layers exist
          setupPopupHandler();
          setupClusterClickHandler();
          setupCursorHandlers();
        }
      } else {
        // Data cleared
        removeDataSourcesAndLayers();
      }
    },
  );

  // Watch searchGeojson
  watch(
    () => props.searchGeojson,
    (newVal) => {
      if (!map || !map.isStyleLoaded()) return;
      updateSearchBoundary(newVal);
      if (newVal) {
        cityBoundariesVisible.value = true;
      }
    },
  );

  // Watch city boundaries toggle
  watch(cityBoundariesVisible, () => {
    if (!map || !map.isStyleLoaded()) return;
    updateSearchBoundary(props.searchGeojson);
  });

  // Watch currentLocation
  watch(
    () => props.currentLocation,
    () => updateLocationMarker(),
  );

  // Watch center prop
  watch(
    () => props.center,
    (newCenter) => {
      if (!map || isInternalUpdate.value) return;
      isInternalUpdate.value = true;
      map.setCenter([newCenter.lng, newCenter.lat]);
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    },
  );

  // Watch zoom prop
  watch(
    () => props.zoom,
    (newZoom) => {
      if (!map || isInternalUpdate.value) return;
      isInternalUpdate.value = true;
      currentZoom.value = newZoom;
      map.setZoom(newZoom);
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    },
  );

  // Watch clustering toggle
  watch(clusteringEnabled, () => {
    if (!map || !map.isStyleLoaded()) return;
    toggleClustering(shouldCluster.value);
  });

  // Watch shouldCluster (zoom-based changes)
  watch(shouldCluster, (newVal) => {
    if (!map || !map.isStyleLoaded()) return;
    toggleClustering(newVal);
  });

  // Watch heatmap toggle
  watch(heatmapEnabled, (on) => {
    if (!map || !map.isStyleLoaded() || !layersAdded) return;
    if (map.getLayer('heatmap-layer')) {
      map.setLayoutProperty('heatmap-layer', 'visibility', on ? 'visible' : 'none');
    }
    setMarkerLayersVisibility(!on);
  });
});

onUnmounted(() => {
  if (locationMarker) {
    locationMarker.remove();
    locationMarker = null;
  }
  if (map) {
    map.remove();
    map = null;
  }
});
</script>

<style scoped>
.map-container {
  width: 100%;
  position: relative;
}

.map-element {
  width: 100%;
  height: 100%;
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

.bottomleft {
  position: absolute;
  bottom: 0px;
  left: 4px;
  z-index: 1000;
}

.bottomright {
  position: absolute;
  bottom: 25px;
  right: 10px;
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

/* Desktop: hide layer button, always show toggles */
.layer-toggle-btn {
  display: none;
}

.layer-toggles {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

@media (min-width: 769px) {
  .layer-toggles {
    display: flex !important;
  }
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

  .layer-toggle-btn {
    display: flex;
    align-self: flex-end;
  }
}
</style>

<style>
/* MapLibre popup overrides (must be unscoped to target popup DOM) */
.df-popup .maplibregl-popup-content {
  background: #1e1e1e;
  color: white;
  border-radius: 12px;
  padding: 0 0 8px 0;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.df-popup .maplibregl-popup-tip {
  border-top-color: #1e1e1e;
}

.df-popup .maplibregl-popup-close-button {
  color: white;
  font-size: 20px;
  right: 4px;
  top: 4px;
}
</style>
