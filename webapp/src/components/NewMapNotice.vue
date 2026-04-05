<template>
  <v-dialog v-model="show" max-width="500" persistent>
    <v-card>
      <v-card-title class="text-center py-4 font-weight-bold">
        <h3 class="headline">Try the New Map</h3>
      </v-card-title>
      <v-card-text>
        <v-img src="/new-df-map.webp" alt="New Map" contain max-width="500" class="mx-auto mb-4 w-full rounded" />
        The DeFlock map has moved to <b>maps.deflock.org</b>. The new map is faster and includes the latest features, such as avoidance routing.
      </v-card-text>
      <v-card-actions class="flex-column px-4 pb-4 gap-2">
        <v-btn
          block
          size="large"
          color="rgb(18, 151, 195)"
          variant="elevated"
          href="https://maps.deflock.org"
        >
          Go to the New Map
          <v-icon end>mdi-arrow-right</v-icon>
        </v-btn>
        <v-btn
          block
          size="large"
          variant="text"
          @click="dismiss"
        >
          Keep Using Old Map
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const show = ref(true);

function dismiss() {
  show.value = false;
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
