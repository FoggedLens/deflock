<template>
  <v-sheet min-width="240">
    <v-list density="compact">
      <v-list-item v-if="isFaceRecognition">
        <div class="d-flex align-center">
          <v-icon start>mdi-face-recognition</v-icon> <b>Face Recognition</b>
        </div>
      </v-list-item>
      <v-list-item>
        <div class="d-flex align-center">
          <v-icon start>mdi-cctv</v-icon> <b>License Plate Reader</b>
        </div>
      </v-list-item>
      <v-list-item v-if="isFaceRecognition">
        <v-icon start>mdi-adjust</v-icon> <b>Omnidirectional</b>
      </v-list-item>
      <v-list-item v-else>
        <div class="d-flex align-center">
          <v-icon start>mdi-compass-outline</v-icon> <b>{{ cardinalDirection }}</b>
        </div>
      </v-list-item>
      <v-list-item>
        <div class="d-flex align-center">
          <v-icon start>mdi-domain</v-icon> <b>
            <span v-if="alpr.tags.manufacturer">
              {{ alpr.tags.manufacturer }}
            </span>
            <span v-else-if="alpr.tags.brand">
              {{ alpr.tags.brand }}
            </span>
            <span v-else>
              Unspecified Manufacturer
            </span>
          </b>
        </div>
      </v-list-item>
      <v-list-item>
        <div class="d-flex align-center">
          <v-icon start>mdi-account-tie</v-icon>
          <b>
            <span v-if="alpr.tags.operator">
              {{ alpr.tags.operator }}
            </span>
            <span v-else>
              Unspecified Operator
            </span>
          </b>
        </div>
      </v-list-item>
    </v-list>

    <div class="text-center">
      <v-btn target="_blank" size="x-small" :href="osmNodeLink(props.alpr.id)" variant="text" color="grey-darken-1"><v-icon start>mdi-open-in-new</v-icon>View on OSM</v-btn>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { ALPR } from '@/types';
import { VIcon, VList, VSheet, VListItem, VBtn } from 'vuetify/components';

const props = defineProps({
  alpr: {
    type: Object as PropType<ALPR>,
    required: true
  }
});

const isFaceRecognition = computed(() => props.alpr.tags.brand === 'Avigilon');

const cardinalDirection = computed(() => {
  const direction = props.alpr.tags.direction || props.alpr.tags["camera:direction"];
  if (direction === undefined) {
    return 'Unspecified Direction';
  } else if (direction.includes(';')) {
    return 'Faces Multiple Directions';
  } else {
    return /^\d+$/.test(direction) ? degreesToCardinal(parseInt(direction)) : direction;
  }
}
);

function degreesToCardinal(degrees: number): string {
  const cardinals = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NE'];
  return 'Faces ' + cardinals[Math.round(degrees / 45) % 8];
}

function osmNodeLink(id: string): string {
  return `https://www.openstreetmap.org/node/${id}`;
}
</script>
