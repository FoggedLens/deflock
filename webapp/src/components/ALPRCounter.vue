<template>
  <div class="dashboard-bg rounded-xl pa-6 pa-sm-4 mx-4 mx-sm-2 text-white">
    <v-row class="ma-0">
      <v-col cols="12" sm="6" class="pa-3 pa-sm-2">
        <div class="d-flex flex-column align-center text-center">
          <v-icon :size="isMobile ? 24 : 32" color="white" class="mb-2">mdi-camera-outline</v-icon>
          <div ref="counterEl" class="font-weight-bold mb-2" :class="isMobile ? 'text-h3' : 'text-h2'">0</div>
          <div class="text-body-1">LPRs mapped in the USA</div>
        </div>
      </v-col>
      <v-col cols="12" sm="6" class="pa-3 pa-sm-2">
        <div class="d-flex flex-column align-center text-center">
          <v-icon :size="isMobile ? 24 : 32" color="white" class="mb-2">mdi-trophy-outline</v-icon>
          <div ref="winsCounterEl" class="font-weight-bold mb-2" :class="isMobile ? 'text-h3' : 'text-h2'">0</div>
          <div class="text-body-1">
            <v-btn to="/council#wins" variant="text">
              Cities Rejecting LPRs
              <v-icon class="ml-1">mdi-arrow-right-thick</v-icon>
            </v-btn>
          </div>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue';
import { useDisplay } from 'vuetify'
import { getALPRCounts } from '@/services/apiService';
import { CountUp } from 'countup.js';

const props = defineProps({
  delayMs: {
    type: Number,
    default: 200,
  }
});

const counterEl: Ref<HTMLElement|null> = ref(null);
const winsCounterEl: Ref<HTMLElement|null> = ref(null);
const countupOptions = {
  useEasing: true,
  useGrouping: true,
  separator: ',',
  decimal: '.',
  prefix: '',
  suffix: '',
};
let counter: CountUp|undefined = undefined;
let winsCounter: CountUp|undefined = undefined;
interface Counts {
  us?: number;
  wins: number;
}
const counts: Ref<Counts> = ref({
  us: undefined,
  wins: 0,
});
const showFinalAnimation = ref(false);
const { xs: isMobile } = useDisplay();

let timeOfMount: number|undefined = undefined;

onMounted(() => {
  timeOfMount = new Date().getTime();
  getALPRCounts().then((countResponse) => {
    counts.value = countResponse;
    countUp(countResponse);
  });
});

function countUp(newCounts: Counts) {
  if (!newCounts.us) return;
  if (!counterEl.value || !winsCounterEl.value) {
    console.error('Counter elements not found');
    return;
  };

  if (!counter && !winsCounter) {
    counter = new CountUp(counterEl.value, newCounts.us, countupOptions);
    winsCounter = new CountUp(winsCounterEl.value, newCounts.wins, countupOptions);

    if (timeOfMount) {
      const timeSinceMount = new Date().getTime() - timeOfMount;
      if (timeSinceMount < props.delayMs) {
        setTimeout(() => {
          counter?.start();
          winsCounter?.start();
        }, props.delayMs - timeSinceMount);
      } else {
        counter.start();
        winsCounter.start();
      }
    }

    setTimeout(() => {
      showFinalAnimation.value = true;
    }, 2500);
  }
}
</script>

<style scoped>
.dashboard-bg {
  background: rgba(0, 0, 0, 0.6);
}
</style>
