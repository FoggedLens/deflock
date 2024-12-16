<template>
  <v-sheet min-width="240">
    <v-list density="compact">
      <v-list-item v-if="isFaceRecognition">
        <v-icon start>mdi-face-recognition</v-icon> <b>Face Recognition</b>
      </v-list-item>
      <v-list-item>
        <v-icon start>mdi-car</v-icon> <b>License Plate</b>
      </v-list-item>
      <v-list-item v-if="isFaceRecognition">
        <v-icon start>mdi-adjust</v-icon> <b>Omnidirectional</b>
      </v-list-item>
      <v-list-item v-else>
        <v-icon start>mdi-cctv</v-icon> <b>Directional {{ alpr.tags.direction ? `(${degreesToCardinal(parseInt(alpr.tags.direction))})` : '' }}</b>
      </v-list-item>
      <v-list-item>
        <v-icon start>mdi-domain</v-icon> <b>
          <span v-if="alpr.tags.manufacturer">
            {{ alpr.tags.manufacturer }}
          </span>
          <span v-else-if="alpr.tags.brand">
            {{ alpr.tags.brand }}
          </span>
          <span v-else>
            Unknown Brand
            <!-- <v-btn :href="osmNodeUrl" variant="text" flat size="x-small" color="warning" target="_blank">
              <v-icon start size="small">mdi-pencil</v-icon>Fix
            </v-btn> -->
          </span>
        </b>
      </v-list-item>
      <v-list-item>
        <v-icon start>mdi-police-badge</v-icon> <b>
          <span v-if="alpr.tags.operator">
            {{ alpr.tags.operator }}
          </span>
          <span v-else>
            Unknown Operator
            <!-- <v-btn :href="osmNodeUrl" variant="text" flat size="x-small" color="warning" target="_blank">
              <v-icon start size="small">mdi-pencil</v-icon>Fix
            </v-btn> -->
          </span>
        </b>
      </v-list-item>
    </v-list>

    <div class="text-center text-grey-darken-1">
      node/{{ alpr.id }}
    </div>
    <!-- <v-data-table density="compact" hide-default-header hide-default-footer disable-sort :items="kvTags" /> -->
  </v-sheet>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import type { PropType } from 'vue';
import type { ALPR } from '@/types';

const props = defineProps({
  alpr: {
    type: Object as PropType<ALPR>,
    required: true
  }
});

const valueTransformations: { [key: string]: (value: string) => string } = {
  direction: (value: string) => `${degreesToCardinal(parseInt(value))} ${value}º`
};

const whitelistedTags = ['brand', 'camera:mount', 'camera:type', 'direction', 'operator'];

const isFaceRecognition = computed(() => props.alpr.tags.brand === 'Avigilon');
const osmNodeUrl = computed(() => `/node/${props.alpr.id}`);

const kvTags = computed(() => {
  return Object.entries(props.alpr.tags)
    .filter(([key]) => whitelistedTags.includes(key))
    .map(([key, value]) => ({ key, value: valueTransformations[key]?.(value) ?? value }));
});

function degreesToCardinal(degrees: number): string {
  const cardinals = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  return cardinals[Math.round(degrees / 45) % 8];
}
</script>
