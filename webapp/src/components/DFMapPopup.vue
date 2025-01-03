<template>
  <v-sheet min-width="240">
    <v-list density="compact">
      <v-list-item v-if="isFaceRecognition">
        <v-icon start>mdi-face-recognition</v-icon> <b>Face Recognition</b>
      </v-list-item>
      <v-list-item>
        <v-icon start>mdi-cctv</v-icon> <b>License Plate Reader</b>
      </v-list-item>
      <v-list-item v-if="isFaceRecognition">
        <v-icon start>mdi-adjust</v-icon> <b>Omnidirectional</b>
      </v-list-item>
      <v-list-item v-else>
        <v-icon start>mdi-compass-outline</v-icon> <b>{{ cardinalDirection }}</b>
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
            Unknown Manufacturer
          </span>
        </b>
      </v-list-item>
      <v-list-item>
        <v-icon start>mdi-account-tie</v-icon> <b>
          <span v-if="alpr.tags.operator">
            {{ alpr.tags.operator }}
          </span>
          <span v-else>
            Unknown Operator
          </span>
        </b>
      </v-list-item>
    </v-list>

    <div class="text-center text-grey-darken-1">
      
      <v-tooltip open-delay="500" text="OSM Node ID" location="bottom">
        <template #activator="{ props }">
          <span style="font-size: 0.9em; cursor: default" v-bind="props">node/{{ alpr.id }}</span>
        </template>
      </v-tooltip>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import type { PropType } from 'vue';
import type { ALPR } from '@/types';
import { VIcon, VList, VSheet, VListItem, VTooltip } from 'vuetify/components';

const props = defineProps({
  alpr: {
    type: Object as PropType<ALPR>,
    required: true
  }
});

const isFaceRecognition = computed(() => props.alpr.tags.brand === 'Avigilon');

const cardinalDirection = computed(() => 
  props.alpr.tags.direction === undefined ? 'Unknown Direction' : degreesToCardinal(parseInt(props.alpr.tags.direction))
);

function degreesToCardinal(degrees: number): string {
  const cardinals = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest'];
  return 'Faces ' + cardinals[Math.round(degrees / 45) % 8];
}
</script>
