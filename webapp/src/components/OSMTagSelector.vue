<template>
  <v-row style="align-items: center; margin-top: 1.25rem;">
    <v-col cols="12" sm="6">
      <h2 class="text-center mb-4">Choose Brand</h2>
      <v-row>
        <v-col v-for="brand in alprBrands" :key="brand.wikidata" cols="6">
          <v-card
            @click="selectedBrand = brand"
            class="text-center"
            :class="{ selected: selectedBrand.wikidata === brand.wikidata }"
            :image="brand.exampleImage"
            min-height="180"
          >
            <v-card-title class="overlay">{{ brand.nickname }}</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-col>

    <v-col cols="12" sm="6">
      <h3 class="text-center">{{ selectedBrand.nickname }}</h3>
      <DFCode>
        man_made=surveillance<br>
        surveillance:type=ALPR<br>
        camera:mount=pole<br>
        camera:type=fixed<br>
        surveillance=public<br>
        surveillance:zone=traffic<br>
        manufacturer=<span class="highlight">{{ selectedBrand.name }}</span><br>
        manufacturer:wikidata=<span class="highlight">{{ selectedBrand.wikidata }}</span><br>
      </DFCode>

      <h5 class="text-center mt-4">and if operator is known</h5>
      <DFCode>
        operator=<span class="highlight">(Police Dept/Owner)</span><br>
        operator:wikidata=<span class="highlight">(WikiData ID)</span><br>
      </DFCode>

      <v-alert
        v-if="selectedBrand.nickname === 'Other'"
        class="mt-4"
        variant="tonal"
        type="warning"
        icon="mdi-information"
        title="Missing a brand?"
      >
        Please let us know by <a href="/contact">contacting us</a> or by <a href="https://github.com/frillweeman/deflock" target="_blank">contributing</a> to the project.
      </v-alert>
    </v-col>

  </v-row>
</template>

<script setup lang="ts">
import DFCode from '@/components/DFCode.vue';
import { ref, type Ref } from 'vue';
import type { WikidataItem } from '@/types';

const alprBrands: WikidataItem[] = [
  {
    name: 'Flock Safety',
    nickname: 'Flock',
    wikidata: 'Q108485435',
    exampleImage: '/flock-1.jpg',
  },
  {
    name: 'Motorola Solutions',
    nickname: 'Motorola',
    wikidata: 'Q634815',
    exampleImage: '/vigilant-1.jpg',
  },
  {
    name: 'Neology, Inc.',
    nickname: 'Neology',
    wikidata: 'Q130958232',
    exampleImage: '/neology-1.jpg',
  },
  {
    name: 'Leonardo',
    nickname: 'Leonardo',
    wikidata: 'Q910379',
    exampleImage: '/elsag.webp',
  },
  {
    name: '(brand goes here)',
    nickname: 'Other',
    wikidata: '(wikidata goes here)',
    exampleImage: '/other-1.jpeg',
  }
];
const selectedBrand: Ref<WikidataItem> = ref(alprBrands[0]);

</script>

<style scoped>
.highlight {
  background-color: #0081ac;
  padding: 0.15rem;
  border-radius: 0.25rem;
  font-weight: bold;
}

.overlay {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 1);
  color: white;
  /* font-family: 'Courier New', Courier, monospace; */
  font-weight: bold;
  text-transform: uppercase;
  font-size: 1.2rem;
}

.selected {
  border: 4px solid #75ddff;
}
</style>
