<template>
  <v-card>
    <v-card-text class="text-center">
      <div class="d-flex flex-row justify-space-between">
        <div class="px-2">
          <h6>US</h6>
          <h4>{{ formatCount(counts.us) }}</h4>
        </div>
        <v-divider vertical></v-divider>
        <div class="px-2">
          <h6>Worldwide</h6>
          <h4>{{ formatCount(counts.worldwide) }}</h4>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getALPRCounts } from '@/services/apiService';

const counts = ref({
  us: null,
  worldwide: null,
});

onMounted(() => {
  getALPRCounts().then((response) => {
    counts.value = response;
  });
});

function formatCount(count: number | null): string {
  if (count === null) {
    return '-';
  }
  if (count < 1000) {
    return Math.round(count / 10) * 10 + '';
  }
  const rounded = Math.round(count / 100) / 10;
  return `${rounded}k+`;
}
</script>
