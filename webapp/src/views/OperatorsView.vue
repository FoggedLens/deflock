<template>
  <v-container class="info-section" max-width="1000">
    <h1>Known Operators</h1>
    <p>
      We regularly scrape Flock's site for cities/counties that have Flock ALPRs. Here is our current list of jurisdictions we've scraped that have ALPRs. Not every Flock operator has opted in to sharing their usage with Flock, so this list is <i>not exhaustive</i>. 
    </p>

    <v-card class="my-4">
      <v-card-text>
        <v-select
          v-model="selectedState"
          :items="distinctStates"
          label="Filter by State"
          outlined
          clearable
        />

        <v-data-table
          v-model:page="page"
          :loading="isLoading"
          :headers="headers"
          :items="filteredCities"
          :items-per-page="8"
          :sort-by="[ { key: 'state', order: 'asc' } ]"
        >
          <template v-slot:item.numCameras="i: any">
            <span v-if="i.item.numCameras">{{ i.item.numCameras }}</span>
            <span v-else>N/A</span>
          </template>

          <template v-slot:item.transparencyReportUrl="i: any">
            <v-btn variant="text" :href="i.item.transparencyReportUrl" target="_blank" :disabled="!i.item.transparencyReportUrl">
              <v-icon start>mdi-eye</v-icon>
              <span v-if="i.item.transparencyReportUrl"> View</span>
              <span v-else> N/A</span>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <h2 id="community-datasets">Community Datasets</h2>
    <p>
      Here are some datasets that have been shared with us by the community through various collection methods (FOIA requests, scraping, wardriving, etc.). If you have a dataset you'd like to share, please reach out to us <router-link to="/contact">here</router-link>.
    </p>
    <p class="mb-4">
      If you'd like to report some of the ALPRs in these data sets so that they can be seen on the map, download the file and follow <router-link to="/report">these instructions</router-link>. Be sure to check that the cameras you're reporting are not already on the map. Please note that these datasets contain only approximate locations of cameras. You will need to verify the locations yourself.
    </p>
    <community-datasets />
    <p class="my-8">
      We are getting a lot of new datasets and trying to decide how to import them at a large scale, since they need to be verified and deduplicated. If you have any ideas or want to help, please reach out to us <router-link to="/contact">here</router-link> or join our <a href="https://discord.gg/aV7v4R3sKT" target="_blank">Discord</a>.
    </p>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { getCities } from '@/services/apiService';
import CommunityDatasets from '@/components/CommunityDatasets.vue';

const page = ref(1);
const selectedState = ref('');
const cities = ref([]);
const filteredCities = computed(() => {
  if (!selectedState.value) {
    return cities.value;
  }

  return cities.value.filter((city: any) => city.state === selectedState.value);
});
const headers = [
  { title: 'State', value: 'state', sortable: true },
  { title: 'City', value: 'city', sortable: true },
  { title: 'Cameras', value: 'numCameras', sortable: true },
  { title: 'Transparency Report', value: 'transparencyReportUrl', sortable: false },
];

const isLoading = computed(() => cities.value.length === 0);
const distinctStates = computed(() => Array.from(new Set(cities.value.map((city: any) => city.state))).sort());

onMounted(() => {
  getCities().then((data: any) => {
    cities.value = data;
  });
});

watch(selectedState, () => {
  page.value = 1;
});

</script>

<style scoped>
/* TODO: put this all in one place, also in what-is view */
h2 {
  margin-top: 2rem;
}

h3 {
  margin-top: 1.25rem;
}

p {
  margin-top: 0.5rem;
}

.flex-image {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
}

code {
  background-color: #f4f4f4;
  padding: 0.5rem;
  border-radius: 0.25rem;
  display: block;
  margin-top: 0.5rem;
}

.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.info-section {
  background: var(--df-page-background-color);
}
</style>
