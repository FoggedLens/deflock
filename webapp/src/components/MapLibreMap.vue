<template>
  <div id="map" :style="{
    height: isFullScreen ? '100dvh' : 'calc(100dvh - 64px)',
    marginTop: isFullScreen ? '0' : '64px',
  }">
    <div class="topleft">
      <slot name="topleft"></slot>
    </div>

    <div class="bottomright">
      <slot name="bottomright"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, watch, ref, type PropType, computed } from 'vue';
import type { ALPR } from '@/types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRoute } from 'vue-router';

const currentRoute = useRoute();

// Internal State Management
const isInternalUpdate = ref(false);
const isFullScreen = computed(() => currentRoute.query?.fullscreen === 'true');

const props = defineProps({
  center: {
    type: Object as PropType<[number, number]>,
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
  currentLocation: {
    type: Object as PropType<[number, number] | null>,
    default: null,
  },
});

const emit = defineEmits(['update:center', 'update:zoom', 'update:bounds']);

// Map instance
let map: maplibregl.Map;

// Map State Management
function initializeMap() {
  map = new maplibregl.Map({
    container: 'map',
    style: 'https://cdn.deflock.me/falconian_dark.json',
    center: props.center,
    zoom: props.zoom,
    minZoom: 3,
    attributionControl: false,
  });

  map.addControl(new maplibregl.AttributionControl({
    compact: true
  }), 'bottom-left');

  map.on('load', () => {
    registerMapEvents();
    emitBoundsUpdate();
  });
}

function emitBoundsUpdate() {
  emit('update:bounds', map.getBounds());
}

// Lifecycle Hooks
onMounted(() => {
  initializeMap();

  // Watch for prop changes
  watch(() => props.center, (newCenter: [number, number]) => {
    if (!isInternalUpdate.value && map) {
      isInternalUpdate.value = true;
      map.setCenter(newCenter);
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    }
  });

  watch(() => props.zoom, (newZoom: number) => {
    if (!isInternalUpdate.value && map) {
      isInternalUpdate.value = true;
      map.setZoom(newZoom);
      setTimeout(() => {
        isInternalUpdate.value = false;
      }, 0);
    }
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
      emitBoundsUpdate();
    }
  });
}
</script>

<style scoped>
@import 'maplibre-gl/dist/maplibre-gl.css';

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

.bottomright {
  position: absolute;
  bottom: 50px; /* hack */
  right: 60px; /* hack */
  z-index: 1000;
}
</style>
